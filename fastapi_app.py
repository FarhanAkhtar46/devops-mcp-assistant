from fastapi import FastAPI, Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from AIToolkitDevops import MCPClient



# Custom middleware to extend timeout to 60s
class TimeoutMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, timeout=60):
        super().__init__(app)
        self.timeout = timeout


    async def dispatch(self, request: StarletteRequest, call_next):
        try:
            return await asyncio.wait_for(call_next(request), timeout=self.timeout)
        except asyncio.TimeoutError:
            from starlette.responses import JSONResponse
            return JSONResponse({"detail": f"Request timed out after {self.timeout} seconds."}, status_code=504)


app = FastAPI()
app.add_middleware(TimeoutMiddleware, timeout=60)


# Reuse a single MCP client session to avoid repeated authentication
app.state.mcp_client = None
app.state.mcp_lock = asyncio.Lock()


# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class InsightRequest(BaseModel):
    prompts: list[str]
    # Optionally add more fields (project, sprint, etc.)


async def get_mcp_client() -> MCPClient:
    async with app.state.mcp_lock:
        if app.state.mcp_client is None:
            client = MCPClient()
            await client.connect_stdio_server(
                "azure devops",
                "npx",
                ["-y", "@azure-devops/mcp", "DevOpsAssistant"],
                {}
            )
            app.state.mcp_client = client
        return app.state.mcp_client


@app.on_event("shutdown")
async def shutdown_event():
    if app.state.mcp_client is not None:
        await app.state.mcp_client.cleanup()
        app.state.mcp_client = None


def flatten_iterations(iterations):
    flat = []
    def walk(node):
        if not isinstance(node, dict):
            return
        flat.append(node)
        for child in node.get("children", []) or []:
            walk(child)
    for n in iterations or []:
        walk(n)
    return flat


def find_iteration(iterations, sprint_id):
    """Find iteration by ID, identifier, path, or name"""
    sprint_id_str = str(sprint_id)
    for node in flatten_iterations(iterations):
        node_id = node.get("id")
        node_identifier = node.get("identifier")
        node_path = node.get("path")
        node_name = node.get("name")
        
        if (node_id is not None and str(node_id) == sprint_id_str) or \
           (node_identifier is not None and str(node_identifier) == sprint_id_str) or \
           (node_path is not None and str(node_path) == sprint_id_str) or \
           (node_name is not None and str(node_name) == sprint_id_str):
            return node
    return None


def normalize_work_items(raw):
    if isinstance(raw, dict):
        # Handle workItemRelations format (from wit_get_work_items_for_iteration)
        if "workItemRelations" in raw:
            return raw.get("workItemRelations", [])
        items = raw.get("workItems") or raw.get("value") or raw.get("items") or []
        return items if isinstance(items, list) else []
    if isinstance(raw, list):
        return raw
    return []


def extract_work_item_ids(items):
    ids = []
    for wi in items or []:
        if not isinstance(wi, dict):
            continue
        for key in ("id", "workItemId"):
            if wi.get(key) is not None:
                ids.append(wi.get(key))
        target = wi.get("target")
        if isinstance(target, dict) and target.get("id") is not None:
            ids.append(target.get("id"))
        source = wi.get("source")
        if isinstance(source, dict) and source.get("id") is not None:
            ids.append(source.get("id"))
    # de-dup while preserving order
    seen = set()
    result = []
    for wi_id in ids:
        if wi_id in seen:
            continue
        seen.add(wi_id)
        result.append(wi_id)
    return result


@app.post("/api/devops-insight")
async def devops_insight(req: InsightRequest):
    client = await get_mcp_client()
    # Use orchestrator for insights
    handled = await client.handle_insight_intent(req.prompts)
    # For demo, just return handled status
    return {"handled": handled}


@app.get("/api/dashboard")
async def dashboard():
    client = await get_mcp_client()
    
    project = "VAIDMS"
    
    # Fetch team
    teams_resp = await client._servers["azure devops"]["session"].call_tool("core_list_project_teams", {"project": project})
    teams = MCPClient.extract_json_from_mcp_response(teams_resp.content)
    team_id = teams[0]["id"] if teams and len(teams) > 0 else None

    # Fetch all iterations (sprints)
    sprints_resp = await client._servers["azure devops"]["session"].call_tool("work_list_iterations", {"project": project})
    sprints = MCPClient.extract_json_from_mcp_response(sprints_resp.content)
    
    # Find current sprint (Dev1)
    sprint_name = "Dev1"
    def find_sprint(node):
        if node.get('name') == sprint_name:
            return node
        for child in node.get('children', []):
            found = find_sprint(child)
            if found:
                return found
        return None
    
    current_sprint = None
    if sprints:
        for s in sprints:
            found = find_sprint(s)
            if found:
                current_sprint = found
                break
    
    active_sprints = 1 if current_sprint else 0
    
    # Fetch open PRs
    prs_resp = await client._servers["azure devops"]["session"].call_tool("repo_list_pull_requests_by_repo_or_project", {"project": project, "status": "Active"})
    prs = MCPClient.extract_json_from_mcp_response(prs_resp.content)
    open_prs = len(prs) if prs else 0

    # Fetch completed items for current sprint using iteration ID
    completed_items = 0
    completed = []
    
    if team_id and current_sprint:
        sprint_identifier = current_sprint.get("identifier")
        
        if sprint_identifier:
            # Use wit_get_work_items_for_iteration (same as your working MCP test)
            iter_payload = {
                "project": project,
                "team": team_id,
                "iterationId": str(sprint_identifier),
            }
            iter_resp = await client._servers["azure devops"]["session"].call_tool(
                "wit_get_work_items_for_iteration",
                iter_payload
            )
            iter_items = MCPClient.extract_json_from_mcp_response(iter_resp.content)
            iter_list = normalize_work_items(iter_items)
            
            iter_ids = extract_work_item_ids(iter_list)
            if iter_ids:
                batch_resp = await client._servers["azure devops"]["session"].call_tool(
                    "wit_get_work_items_batch_by_ids",
                    {"project": project, "ids": iter_ids}
                )
                batch_items = MCPClient.extract_json_from_mcp_response(batch_resp.content)
                all_items = normalize_work_items(batch_items)
                
                # Filter for closed items
                completed = [wi for wi in all_items if wi.get("fields", {}).get("System.State", "").lower() in {"closed", "done", "resolved"}]
                completed_items = len(completed)

    # Avg. Resolution (in hours)
    from datetime import datetime, timedelta
    def parse_dt(dt):
        try:
            return datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except Exception:
            return None
    
    pr_durations = []
    if prs:
        for pr in prs:
            if pr.get('status') == 'Completed' and pr.get('creationDate') and pr.get('closedDate'):
                start = parse_dt(pr['creationDate'])
                end = parse_dt(pr['closedDate'])
                if start and end:
                    pr_durations.append((end - start).total_seconds() / 3600)
    
    wi_durations = []
    if completed:
        for wi in completed:
            if not isinstance(wi, dict):
                continue
            fields = wi.get("fields", {})
            created = fields.get("System.CreatedDate")
            closed = fields.get("Microsoft.VSTS.Common.ClosedDate")
            if created and closed:
                start = parse_dt(created)
                end = parse_dt(closed)
                if start and end:
                    wi_durations.append((end - start).total_seconds() / 3600)
    
    all_durations = pr_durations + wi_durations
    avg_resolution = round(sum(all_durations) / len(all_durations), 1) if all_durations else 0

    # Velocity Trend
    from collections import defaultdict
    import pytz
    velocity = defaultdict(int)
    now = datetime.utcnow().replace(tzinfo=pytz.UTC)
    
    for wi in completed:
        if not isinstance(wi, dict):
            continue
        fields = wi.get("fields", {})
        closed = fields.get("Microsoft.VSTS.Common.ClosedDate")
        if closed:
            dt = parse_dt(closed)
            if dt:
                year, week, _ = dt.isocalendar()
                velocity[(year, week)] += 1
    
    trend = []
    if current_sprint and current_sprint.get('attributes', {}).get('startDate') and current_sprint.get('attributes', {}).get('finishDate'):
        start_dt = parse_dt(current_sprint['attributes']['startDate'])
        finish_dt = parse_dt(current_sprint['attributes']['finishDate'])
        week_cursor = start_dt
        while week_cursor <= finish_dt:
            year, week, _ = week_cursor.isocalendar()
            trend.append({
                "week": f"{year}-W{week}",
                "completed": velocity.get((year, week), 0)
            })
            week_cursor += timedelta(weeks=1)
    else:
        for i in range(6, -1, -1):
            week_dt = now - timedelta(weeks=i)
            year, week, _ = week_dt.isocalendar()
            trend.append({
                "week": f"{year}-W{week}",
                "completed": velocity.get((year, week), 0)
            })

    # Recent Activity
    activity = []
    if prs:
        for pr in prs[:5]:
            activity.append({
                "type": "pr",
                "title": f"PR #{pr.get('pullRequestId', pr.get('id', ''))} {pr.get('status', '')}",
                "timestamp": pr.get('creationDate', '')
            })
    
    if completed:
        count = 0
        for wi in completed:
            if not isinstance(wi, dict):
                continue
            fields = wi.get("fields", {})
            activity.append({
                "type": "workitem",
                "title": f"Work Item #{fields.get('System.Id', '')} Closed",
                "timestamp": fields.get("Microsoft.VSTS.Common.ClosedDate", "")
            })
            count += 1
            if count >= 5:
                break
    
    activity = sorted(activity, key=lambda x: x['timestamp'], reverse=True)[:7]

    if current_sprint:
        activity.append({
            "type": "sprint",
            "title": f"Sprint '{current_sprint.get('name', '')}' started",
            "timestamp": current_sprint.get('attributes', {}).get('startDate', '')
        })

    return {
        "welcome": {
            "user": "Alex Johnson",
            "role": "Sr. DevOps Engineer",
            "message": f"The sprint planning for '{current_sprint.get('name', 'N/A') if current_sprint else 'N/A'}' is looking solid. You have {open_prs} code reviews pending and the system health is optimal."
        },
        "stats": {
            "activeSprints": active_sprints,
            "openPRs": open_prs,
            "completedItems": completed_items,
            "avgResolution": avg_resolution,
            "velocityTrend": trend
        },
        "activityFeed": activity
    }


@app.get("/api/sprints")
async def list_sprints():
    client = await get_mcp_client()
    project = "VAIDMS"
    sprints_resp = await client._servers["azure devops"]["session"].call_tool(
        "work_list_iterations",
        {"project": project}
    )
    sprints = MCPClient.extract_json_from_mcp_response(sprints_resp.content)
    flat = flatten_iterations(sprints)
    result = []
    for node in flat:
        # Skip parent iteration containers (they have children and no dates)
        if node.get("hasChildren") and not node.get("attributes"):
            continue
            
        attrs = node.get("attributes", {}) or {}
        time_frame = (attrs.get("timeFrame") or "").lower()
        if time_frame == "current":
            status = "current"
        elif time_frame == "future":
            status = "future"
        else:
            status = "past"
        
        # Use identifier as primary ID (this is the GUID used by team iteration APIs)
        sprint_id = node.get("identifier") or node.get("id") or node.get("name")
        
        result.append({
            "id": str(sprint_id),
            "name": node.get("name"),
            "startDate": attrs.get("startDate") or "",
            "endDate": attrs.get("finishDate") or "",
            "status": status,
        })
    return result


@app.get("/api/sprints/{sprint_id}/insights")
async def sprint_insights(sprint_id: str):
    client = await get_mcp_client()
    project = "VAIDMS"

    print(f"\n[DEBUG] ===== Starting sprint_insights for sprint_id={sprint_id} =====\n")

    teams_resp = await client._servers["azure devops"]["session"].call_tool(
        "core_list_project_teams",
        {"project": project}
    )
    teams = MCPClient.extract_json_from_mcp_response(teams_resp.content)
    team_id = teams[0]["id"] if teams and len(teams) > 0 else None
    if not team_id:
        raise HTTPException(status_code=404, detail="No team found for project.")

    # Fetch all iterations to find the requested sprint
    sprints_resp = await client._servers["azure devops"]["session"].call_tool(
        "work_list_iterations",
        {"project": project}
    )
    sprints = MCPClient.extract_json_from_mcp_response(sprints_resp.content)
    sprint = find_iteration(sprints, sprint_id)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found.")
    
    print(f"[DEBUG] Found sprint: {sprint.get('name')} (id={sprint.get('id')}, identifier={sprint.get('identifier')})")

    # Get team iterations to find the matching team iteration ID
    team_iters_resp = await client._servers["azure devops"]["session"].call_tool(
        "work_list_team_iterations",
        {"project": project, "team": team_id}
    )
    team_iters = MCPClient.extract_json_from_mcp_response(team_iters_resp.content)
    print(f"[DEBUG] Team iterations: {len(team_iters)} iterations found")
    
    # Match sprint by identifier (GUID)
    iteration_id = None
    sprint_identifier = sprint.get("identifier")
    sprint_name_lower = str(sprint.get("name") or "").lower()
    
    print(f"[DEBUG] Looking for sprint with identifier={sprint_identifier}, name={sprint.get('name')}")
    
    for it in team_iters or []:
        it_id = it.get("id") or it.get("identifier")
        it_name_lower = str(it.get("name") or "").lower()
        
        print(f"[DEBUG] Checking team iteration: id={it_id}, name={it.get('name')}")
        
        # Match by identifier (GUID) - most reliable
        if sprint_identifier and it_id == sprint_identifier:
            iteration_id = it_id
            print(f"[DEBUG] ✓ Matched by identifier: {iteration_id}")
            break
        
        # Match by name (case-insensitive)
        if it_name_lower == sprint_name_lower:
            iteration_id = it_id
            print(f"[DEBUG] ✓ Matched by name: {iteration_id}")
            break
    
    if not iteration_id:
        print(f"[DEBUG] ✗ No matching team iteration found for sprint {sprint.get('name')}")
        raise HTTPException(status_code=404, detail=f"Team iteration not found for sprint '{sprint.get('name')}'")

    # Fetch work items using wit_get_work_items_for_iteration (WORKING METHOD from your MCP test)
    all_items = []
    print(f"[DEBUG] Fetching work items for iterationId={iteration_id}")
    
    iter_payload = {
        "project": project,
        "team": team_id,
        "iterationId": str(iteration_id),
    }
    
    try:
        iter_resp = await client._servers["azure devops"]["session"].call_tool(
            "wit_get_work_items_for_iteration",
            iter_payload
        )
        iter_items = MCPClient.extract_json_from_mcp_response(iter_resp.content)
        iter_list = normalize_work_items(iter_items)
        print(f"[DEBUG] Found {len(iter_list)} work item relations from iteration query")
        
        iter_ids = extract_work_item_ids(iter_list)
        print(f"[DEBUG] Extracted work item IDs: {iter_ids}")
        
        if iter_ids:
            print(f"[DEBUG] Fetching detailed info for {len(iter_ids)} work items")
            batch_resp = await client._servers["azure devops"]["session"].call_tool(
                "wit_get_work_items_batch_by_ids",
                {"project": project, "ids": iter_ids}
            )
            batch_items = MCPClient.extract_json_from_mcp_response(batch_resp.content)
            all_items = normalize_work_items(batch_items)
            print(f"[DEBUG] Successfully fetched {len(all_items)} detailed work items")
        else:
            print("[DEBUG] No work item IDs extracted from iteration query")
    except Exception as e:
        print(f"[DEBUG] Error fetching work items for iteration: {e}")
        all_items = []

    def parse_dt(dt):
        try:
            from datetime import datetime
            return datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except Exception:
            return None

    def get_fields(wi):
        return wi.get("fields", {}) if isinstance(wi, dict) else {}

    def get_state(wi):
        if not isinstance(wi, dict):
            return ""
        fields = get_fields(wi)
        return str(fields.get("System.State") or "")

    completed_states = {"closed", "done", "resolved"}
    completed_items = [wi for wi in all_items if get_state(wi).lower() in completed_states]
    print(f"[DEBUG] Completed items: {len(completed_items)} out of {len(all_items)}")

    def get_assignee(wi):
        if not isinstance(wi, dict):
            return "Unassigned"
        fields = get_fields(wi)
        val = fields.get("System.AssignedTo")
        if isinstance(val, dict):
            return val.get("displayName") or val.get("uniqueName") or "Unassigned"
        if isinstance(val, str):
            return val
        return "Unassigned"

    def get_effort(wi):
        if not isinstance(wi, dict):
            return 1
        fields = get_fields(wi)
        for key in ("Microsoft.VSTS.Scheduling.Effort", "Microsoft.VSTS.Scheduling.StoryPoints"):
            val = fields.get(key)
            if isinstance(val, (int, float)):
                return float(val)
        return 1

    total_items = len(all_items)
    completed_count = len(completed_items)
    progress = round((completed_count / total_items) * 100, 1) if total_items > 0 else 0

    total_effort = sum(get_effort(wi) for wi in all_items)
    completed_effort = sum(get_effort(wi) for wi in completed_items)
    velocity = round(completed_effort, 1)

    print(f"[DEBUG] Metrics - Progress: {progress}%, Velocity: {velocity}, Total items: {total_items}, Completed: {completed_count}")

    member_capacity_map = {}
    for wi in all_items:
        assignee = get_assignee(wi)
        member_capacity_map.setdefault(assignee, 0)
        member_capacity_map[assignee] += get_effort(wi)

    member_capacity = [
        {"name": name, "capacity": 40, "assigned": round(assigned, 1)}
        for name, assigned in member_capacity_map.items()
    ]

    burndown_data = []
    attrs = sprint.get("attributes", {}) or {}
    start_dt = parse_dt(attrs.get("startDate") or "")
    finish_dt = parse_dt(attrs.get("finishDate") or "")
    if start_dt and finish_dt:
        from datetime import timedelta
        start_day = start_dt.date()
        finish_day = finish_dt.date()
        days = (finish_day - start_day).days
        if days < 0:
            days = 0
        completed_by_day = []
        for wi in completed_items:
            fields = get_fields(wi)
            closed = fields.get("Microsoft.VSTS.Common.ClosedDate")
            closed_dt = parse_dt(closed) if closed else None
            if closed_dt:
                completed_by_day.append((closed_dt.date(), get_effort(wi)))

        for i in range(days + 1):
            day = start_day + timedelta(days=i)
            done = sum(effort for d, effort in completed_by_day if d <= day)
            remaining = max(total_effort - done, 0)
            ideal = total_effort - (total_effort * (i / days)) if days > 0 else 0
            burndown_data.append({
                "day": f"Day {i + 1}",
                "remaining": round(remaining, 1),
                "ideal": round(ideal, 1),
            })

    print(f"[DEBUG] ===== Completed sprint_insights for sprint_id={sprint_id} =====\n")

    return {
        "velocity": velocity,
        "capacity": 40 * len(member_capacity) if member_capacity else 0,
        "progress": progress,
        "completedItems": completed_count,
        "totalItems": total_items,
        "burndownData": burndown_data,
        "memberCapacity": member_capacity,
    }
