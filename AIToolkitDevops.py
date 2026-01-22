import re
"""Connect model with mcp tools in Python
# Run this python script
> pip install mcp azure-ai-inference
> python <this-script-path>.py
"""
import asyncio
import json
import os
from typing import Dict, Optional
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.sse import sse_client
from mcp.client.streamable_http import streamablehttp_client


from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import AssistantMessage, SystemMessage, UserMessage, ToolMessage
from azure.ai.inference.models import ImageContentItem, ImageUrl, TextContentItem
from azure.core.credentials import AzureKeyCredential

class MCPClient:

        @staticmethod
        def extract_json_from_mcp_response(response):
            """
            Extracts JSON from MCP tool responses, handling TextContent objects and lists.
            """
            import json
            # If response is a list, get the first item
            if isinstance(response, list) and response:
                item = response[0]
                # If it's a TextContent object, get its 'text' attribute
                if hasattr(item, 'text'):
                    response = item.text
                else:
                    response = str(item)
            # If it's a TextContent object directly
            elif hasattr(response, 'text'):
                response = response.text
            # Now try to parse as JSON
            try:
                return json.loads(response)
            except Exception as e:
                print("Failed to parse JSON:", e)
                print("Raw response:", response)
                return None

        async def handle_insight_intent(self, user_prompts):
            """
            Detects user intent and orchestrates MCP tool calls for:
            1. Sprint Insight (velocity, capacity, progress)
            2. Code Review Insights (PR patterns, review efficiency)
            3. Sprint Planning Support (AI recommendations)
            4. Real-time Metrics (KPIs)
            Returns True if handled, else False.
            """
            # Lowercase all prompts for intent matching
            prompt_text = " ".join(user_prompts).lower()
            # Sprint insight
            sprint_match = re.search(r"sprint insight.*?(?:for|of)?\s*([\w\- ]+)?", prompt_text)
            if sprint_match or "velocity" in prompt_text or "capacity" in prompt_text or "work progress" in prompt_text:
                sprint_name = sprint_match.group(1).strip() if sprint_match and sprint_match.group(1) else None
                print("[AI] Sprint Insight requested.")
                if not sprint_name:
                    sprint_name = input("Enter sprint name: ").strip()
                # Example tool names (replace with actual MCP tool names as needed)
                tool_calls = [
                    ("g-azure-devops-boards_get_sprint_velocity", {"sprint": sprint_name}),
                    ("g-azure-devops-boards_get_sprint_capacity", {"sprint": sprint_name}),
                    ("g-azure-devops-boards_get_sprint_progress", {"sprint": sprint_name}),
                ]
                results = {}
                for tool, args in tool_calls:
                    if tool in self._tool_to_server_map:
                        server_id = self._tool_to_server_map[tool]
                        session = self._servers[server_id]["session"]
                        res = await session.call_tool(tool, args)
                        results[tool] = res.content
                print("\n[AI Sprint Insight]")
                print(f"Sprint: {sprint_name}")
                print(f"Velocity: {results.get('g-azure-devops-boards_get_sprint_velocity')}")
                print(f"Capacity: {results.get('g-azure-devops-boards_get_sprint_capacity')}")
                print(f"Progress: {results.get('g-azure-devops-boards_get_sprint_progress')}")
                return True

            # Code Review Insights
            if "code review" in prompt_text or "pull request" in prompt_text or "review efficiency" in prompt_text:
                print("[AI] Code Review Insights requested.")
                # Try to extract project name (e.g., 'in PR at VAIDMS project' or 'for VAIDMS')
                project_match = re.search(r"(?:in|for|at)\s+([\w\-]+)\s*project", prompt_text)
                if not project_match:
                    project_match = re.search(r"(?:in|for|at)\s+([\w\-]+)", prompt_text)
                project = project_match.group(1) if project_match else None
                if not project:
                    project = input("Enter project name for code review insights: ").strip()
                tool_calls = [
                    ("g-azure-devops-repos_list_pull_requests", {"project": project, "status": "all"}),
                    ("g-azure-devops-repos_get_review_stats", {"project": project}),
                ]
                print(f"[DEBUG] Using project name: '{project}' (type: {type(project)})")
                results = {}
                for tool, args in tool_calls:
                    print(f"[DEBUG] Calling tool: {tool} with args: {args}")
                    if tool in self._tool_to_server_map:
                        server_id = self._tool_to_server_map[tool]
                        session = self._servers[server_id]["session"]
                        res = await session.call_tool(tool, args)
                        print(f"[DEBUG] Raw response from {tool}: type={type(res.content)}, value={res.content}")
                        results[tool] = res.content
                    else:
                        print(f"[DEBUG] Tool {tool} not found in tool-to-server map.")
                print("\n[AI Code Review Insights]")
                pr_list = results.get('g-azure-devops-repos_list_pull_requests')
                review_stats = results.get('g-azure-devops-repos_get_review_stats')
                if pr_list and pr_list != 'None' and pr_list != '[]':
                    print(f"Pull Request Patterns: {pr_list}")
                else:
                    print("No pull requests found for project:", project)
                if review_stats and review_stats != 'None' and review_stats != '{}':
                    print(f"Review Efficiency: {review_stats}")
                else:
                    print("No review stats found for project:", project)
                return True

            # Sprint Planning Support
            if "sprint planning" in prompt_text or "planning support" in prompt_text or "ai recommend" in prompt_text or "scope" in prompt_text or "priorit" in prompt_text:
                print("[AI] Sprint Planning Support requested.")
                tool = "g-azure-devops-boards_get_sprint_planning_recommendations"
                args = {}
                if tool in self._tool_to_server_map:
                    server_id = self._tool_to_server_map[tool]
                    session = self._servers[server_id]["session"]
                    res = await session.call_tool(tool, args)
                    print("\n[AI Sprint Planning Recommendations]")
                    print(res.content)
                else:
                    print("[AI] Planning tool not available.")
                return True

            # Real-time Metrics
            if "real-time metric" in prompt_text or "kpi" in prompt_text or "performance indicator" in prompt_text:
                print("[AI] Real-time Metrics requested.")
                tool = "g-azure-devops-boards_get_realtime_kpis"
                args = {}
                if tool in self._tool_to_server_map:
                    server_id = self._tool_to_server_map[tool]
                    session = self._servers[server_id]["session"]
                    res = await session.call_tool(tool, args)
                    print("\n[AI Real-time KPIs]")
                    print(res.content)
                else:
                    print("[AI] KPI tool not available.")
                return True

            return False
        def __init__(self):
            # Initialize session and client objects
            self._servers = {}
            self._tool_to_server_map = {}
            self.exit_stack = AsyncExitStack()
            # To authenticate with the model you will need to generate a personal access token (PAT) in your GitHub settings.
            # Create your PAT token by following instructions here: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
            # Attempt to load a local .env for developer convenience if python-dotenv is installed.
            try:
                from dotenv import load_dotenv
                load_dotenv()
            except Exception:
                # dotenv is optional; continue if it's not available
                pass

            azure_key = os.environ.get("AZURE_AI_API_KEY")
            if not azure_key:
                raise RuntimeError(
                    "AZURE_AI_API_KEY is not set. Set the environment variable or create a .env file with AZURE_AI_API_KEY=<key>."
                )

            self.azureai = ChatCompletionsClient(
                endpoint = "https://prd-generator-workflow-resource.openai.azure.com/openai/deployments/gpt-4.1",
                credential = AzureKeyCredential(azure_key),
                api_version = "2025-01-01-preview",
            )

        async def connect_stdio_server(self, server_id: str, command: str, args: list[str], env: Dict[str, str]):
            """Connect to an MCP server using STDIO transport
            
            Args:
                server_id: Unique identifier for this server connection
                command: Command to run the MCP server
                args: Arguments for the command
                env: Optional environment variables
            """
            server_params = StdioServerParameters(
                command=command,
                args=args,
                env=env
            )
            
            stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
            stdio, write = stdio_transport
            session = await self.exit_stack.enter_async_context(ClientSession(stdio, write))
            await session.initialize()
            
            # Register the server
            await self._register_server(server_id, session)
        
        async def connect_sse_server(self, server_id: str, url: str, headers: Dict[str, str]):
            """Connect to an MCP server using SSE transport
            
            Args:
                server_id: Unique identifier for this server connection
                url: URL of the SSE server
                headers: Optional HTTP headers
            """
            sse_context = await self.exit_stack.enter_async_context(sse_client(url=url, headers=headers))
            read, write = sse_context
            session = await self.exit_stack.enter_async_context(ClientSession(read, write))
            await session.initialize()
            
            # Register the server
            await self._register_server(server_id, session)
        
        async def connect_http_server(self, server_id: str, url: str, headers: Dict[str, str]):
            """Connect to an MCP server using HTTP transport
            
            Args:
                server_id: Unique identifier for this server connection
                url: URL of the HTTP server
                headers: Optional HTTP headers
            """
            http_context = await self.exit_stack.enter_async_context(streamablehttp_client(url=url, headers=headers))
            read, write, sessionId = http_context
            session = await self.exit_stack.enter_async_context(ClientSession(read, write))
            await session.initialize()
            
            # Register the server
            await self._register_server(server_id, session)
        
        async def _register_server(self, server_id: str, session: ClientSession):
            """Register a server and its tools in the client
            
            Args:
                server_id: Unique identifier for this server
                session: Connected ClientSession
            """
            # List available tools
            response = await session.list_tools()
            tools = response.tools
            
            # Store server connection info
            self._servers[server_id] = {
                "session": session,
                "tools": tools
            }
            
            # Update tool-to-server mapping
            for tool in tools:
                self._tool_to_server_map[tool.name] = server_id
                
            print(f"\nConnected to server '{server_id}' with tools:", [tool.name for tool in tools])

        async def chatWithTools(self, messages: list[any]) -> str:
            """Chat with model and using tools
            Args:
                messages: Messages to send to the model
            """
            if not self._servers:
                raise ValueError("No MCP servers connected. Connect to at least one server first.")

            # Collect tools from all connected servers
            available_tools = []
            for server_id, server_info in self._servers.items():
                for tool in server_info["tools"]:
                    available_tools.append({ 
                        "type": "function",
                        "function": {
                            "name": tool.name,
                            "description": tool.description,
                            "parameters": tool.inputSchema
                        },
                    })

            while True:

                # Call model
                response = self.azureai.complete(
                    messages = messages,
                    model = "gpt-4.1",
                    tools=available_tools,
                )
                hasToolCall = False

                if response.choices[0].message.tool_calls:
                    for tool in response.choices[0].message.tool_calls:
                        hasToolCall = True
                        tool_name = tool.function.name
                        tool_args = json.loads(tool.function.arguments)
                        messages.append(
                            AssistantMessage(
                                tool_calls = [{
                                    "id": tool.id,
                                    "type": "function",
                                    "function": {
                                        "name": tool.function.name,
                                        "arguments": tool.function.arguments,
                                    }
                                }]
                            )
                        )
                    
                    
                        # Find the appropriate server for this tool
                        if tool_name in self._tool_to_server_map:
                            server_id = self._tool_to_server_map[tool_name]
                            server_session = self._servers[server_id]["session"]
                            
                            # Execute tool call on the appropriate server
                            result = await server_session.call_tool(tool_name, tool_args)
                            print(f"[Server '{server_id}' call tool '{tool_name}' with args {tool_args}]: {result.content}")

                            messages.append(
                                ToolMessage(
                                    tool_call_id = tool.id,
                                    content = str(result.content)
                                )
                            )
                else:
                    messages.append(
                        AssistantMessage(
                            content = response.choices[0].message.content
                        )
                    )
                    print(f"[Model Response]: {response.choices[0].message.content}")
            
                if not hasToolCall:
                    break
        
        async def cleanup(self):
            """Clean up resources"""
            await self.exit_stack.aclose()
            await asyncio.sleep(1)

async def main():
    import argparse

    parser = argparse.ArgumentParser(description="Run the AIToolkit DevOps MCP client")
    parser.add_argument("-m", "--message", action="append", help="User message to send to the model (can be used multiple times).")
    parser.add_argument("--no-interactive", action="store_true", help="Do not prompt interactively if no messages are provided.")
    args = parser.parse_args()

    # Collect user messages from CLI or interactively
    user_prompts: list[str] = args.message or []
    if not user_prompts and not args.no_interactive:
        print("Enter user messages (blank line to finish):")
        while True:
            try:
                line = input("> ").strip()
            except EOFError:
                break
            if line == "":
                break
            user_prompts.append(line)

    if not user_prompts:
        print("No user messages provided. Use -m/--message or run interactively.")
        return

    client = MCPClient()

    messages = [
        SystemMessage(content = "You are an Azure DevOps Operations Agent with access to Azure DevOps MCP tools.\nYour responsibility is to retrieve, manage, and create Azure DevOps resources using the available MCP tool actions only.\nYou must:\nUse MCP tools for all Azure DevOps interactions\nNever fabricate data\nAlways confirm required identifiers before performing write actions\n\nResponse Format\nAlways respond in the following structure:\nAction Summary\nWhat operation is being performed\nResolved Identifiers\nProject ID\nTeam ID (if applicable)\nIdentity ID (if applicable)\nTool Invocation\nMCP tool name\nParameters passed\nResult\nSuccess or failure\nReturned data in a readable format")
    ]

    for prompt in user_prompts:
        messages.append(UserMessage(content = [TextContentItem(text = prompt)]))
    try:
        await client.connect_stdio_server(
            "azure devops", 
            "npx", 
            [
                "-y",
                "@azure-devops/mcp",
                "DevOpsAssistant",
            ],
            {
            }
        )
        # Try to handle with insight orchestrator first
        handled = await client.handle_insight_intent(user_prompts)
        if not handled:
            await client.chatWithTools(messages)
    except Exception as e:
        print(f"\nError: {str(e)}")
    finally:
        await client.cleanup()

if __name__ == "__main__":
    asyncio.run(main())