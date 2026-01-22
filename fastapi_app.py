from fastapi import FastAPI, Request
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

@app.post("/api/devops-insight")
async def devops_insight(req: InsightRequest):
    client = MCPClient()
    # Connect to MCP server (adjust args as needed)
    await client.connect_stdio_server(
        "azure devops",
        "npx",
        ["-y", "@azure-devops/mcp", "DevOpsAssistant"],
        {}
    )
    # Use orchestrator for insights
    handled = await client.handle_insight_intent(req.prompts)
    # For demo, just return handled status
    return {"handled": handled}

@app.get("/api/dashboard")
async def dashboard():
    client = MCPClient()
    await client.connect_stdio_server(
        "azure devops",
        "npx",
        ["-y", "@azure-devops/mcp", "DevOpsAssistant"],
        {}
    )
    # Print all available tool names for debugging
    for tool in client._servers["azure devops"]["tools"]:
        print(f"[MCP TOOL AVAILABLE] {tool.name}")
    
    # Example: Replace 'VAIDMS' with your project or make dynamic
    project = "VAIDMS"
    # Fetch a team for the project (use first team for backlogId, as required by API)
    teams_resp = await client._servers["azure devops"]["session"].call_tool("core_list_project_teams", {"project": project})
    teams = MCPClient.extract_json_from_mcp_response(teams_resp.content)
    team_id = teams[0]["id"] if teams and len(teams) > 0 else None
    team_name = teams[0]["name"] if teams and len(teams) > 0 else None

    # Fetch all iterations (sprints) for the project (no team param)
    sprints_resp = await client._servers["azure devops"]["session"].call_tool("work_list_iterations", {"project": project})
    print(f"[DEBUG] work_list_iterations raw response: {sprints_resp.content}")
    sprints = MCPClient.extract_json_from_mcp_response(sprints_resp.content)
    print("[DEBUG] All sprints/iterations:")
    for s in sprints or []:
        print(f"name: {s.get('name')}, timeFrame: {s.get('attributes', {}).get('timeFrame')}, path: {s.get('path')}")
    # Recursively search for the current sprint by name in all children
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
    print(f"[DEBUG] Found current_sprint: {current_sprint}")
    active_sprints = 1 if current_sprint else 0
    # Fetch open PRs (status must be 'Active' with capital A)
    prs_resp = await client._servers["azure devops"]["session"].call_tool("repo_list_pull_requests_by_repo_or_project", {"project": project, "status": "Active"})
    prs = MCPClient.extract_json_from_mcp_response(prs_resp.content)
    open_prs = len(prs) if prs else 0

    # Fetch a team for the project (use first team for backlogId, as required by API)
    teams_resp = await client._servers["azure devops"]["session"].call_tool("core_list_project_teams", {"project": project})
    teams = MCPClient.extract_json_from_mcp_response(teams_resp.content)
    team_id = teams[0]["id"] if teams and len(teams) > 0 else None

    # Fetch a backlogId for the team
    backlog_id = None
    if team_id:
        backlogs_resp = await client._servers["azure devops"]["session"].call_tool("wit_list_backlogs", {"project": project, "team": team_id})
        backlogs = MCPClient.extract_json_from_mcp_response(backlogs_resp.content)
        backlog_id = backlogs[0]["id"] if backlogs and len(backlogs) > 0 else None

    # Fetch completed items (work items in closed state) for the current sprint only
    completed_items = 0
    completed = []
    if team_id and backlog_id and current_sprint:
        iteration_path = current_sprint.get('path')
        work_items_payload = {"project": project, "team": team_id, "backlogId": backlog_id, "state": "Closed", "iteration": iteration_path}
        print(f"[DEBUG] wit_list_backlog_work_items payload: {work_items_payload}")
        completed_resp = await client._servers["azure devops"]["session"].call_tool(
            "wit_list_backlog_work_items",
            work_items_payload
        )
        print(f"[DEBUG] wit_list_backlog_work_items raw response: {completed_resp.content}")
        completed = MCPClient.extract_json_from_mcp_response(completed_resp.content)
        print(f"[DEBUG] wit_list_backlog_work_items parsed: {completed}")
        completed_items = len(completed) if completed else 0

    # --- Avg. Resolution (in hours) ---
    from datetime import datetime, timedelta
    def parse_dt(dt):
        try:
            return datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except Exception:
            return None
    # For PRs
    pr_durations = []
    if prs:
        for pr in prs:
            if pr.get('status') == 'Completed' and pr.get('creationDate') and pr.get('closedDate'):
                start = parse_dt(pr['creationDate'])
                end = parse_dt(pr['closedDate'])
                if start and end:
                    pr_durations.append((end - start).total_seconds() / 3600)
    # For completed work items
    wi_durations = []
    if completed:
        for wi in completed:
            if not isinstance(wi, dict):
                continue
            created = wi.get('createdDate')
            closed = wi.get('closedDate')
            if created and closed:
                start = parse_dt(created)
                end = parse_dt(closed)
                if start and end:
                    wi_durations.append((end - start).total_seconds() / 3600)
    all_durations = pr_durations + wi_durations
    avg_resolution = round(sum(all_durations) / len(all_durations), 1) if all_durations else 0

    # --- Velocity Trend (completed items per week) ---
    from collections import defaultdict
    import pytz
    import math
    velocity = defaultdict(int)
    now = datetime.utcnow().replace(tzinfo=pytz.UTC)
    print("[DEBUG] Completed work items for velocity calculation:")
    for wi in completed:
        if not isinstance(wi, dict):
            continue
        closed = wi.get('closedDate')
        print(f"  WorkItem ID: {wi.get('id')}, closedDate: {closed}")
        if closed:
            dt = parse_dt(closed)
            print(f"    Parsed closedDate: {dt}")
            if dt:
                year, week, _ = dt.isocalendar()
                print(f"    Year: {year}, Week: {week}")
                velocity[(year, week)] += 1
    print(f"[DEBUG] Velocity dict: {dict(velocity)}")
    # Calculate velocity trend for the current sprint's time window only
    trend = []
    if current_sprint and current_sprint.get('attributes', {}).get('startDate') and current_sprint.get('attributes', {}).get('finishDate'):
        start_dt = parse_dt(current_sprint['attributes']['startDate'])
        finish_dt = parse_dt(current_sprint['attributes']['finishDate'])
        # Build week buckets between start and finish
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

    # --- Recent Activity (last 5 PRs and 5 work items, sorted by date) ---
    activity = []
    # PRs
    if prs:
        for pr in prs[:5]:
            activity.append({
                "type": "pr",
                "title": f"PR #{pr.get('pullRequestId', pr.get('id', ''))} {pr.get('status', '')}",
                "timestamp": pr.get('creationDate', '')
            })
    # Work items
    if completed:
        count = 0
        for wi in completed:
            if not isinstance(wi, dict):
                continue
            activity.append({
                "type": "workitem",
                "title": f"Work Item #{wi.get('id', '')} Closed",
                "timestamp": wi.get('closedDate', '')
            })
            count += 1
            if count >= 5:
                break
    # Sort by timestamp desc
    activity = sorted(activity, key=lambda x: x['timestamp'], reverse=True)[:7]

    # Add a sprint activity example
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
