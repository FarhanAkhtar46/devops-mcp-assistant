# AI Toolkit DevOps Project Details

## Project Overview
This project provides a Python-based DevOps assistant that connects to Azure DevOps via MCP (Model Context Protocol) tools and leverages Azure OpenAI for AI-powered insights. It enables:
- Sprint insights (velocity, capacity, progress)
- Code review insights (pull request patterns, review efficiency)
- Sprint planning support (AI recommendations)
- Real-time DevOps KPIs and metrics
- Dynamic, interactive CLI for user queries

## Key Features
- Connects to MCP servers using STDIO, SSE, or HTTP transports
- Integrates with Azure OpenAI (GPT-4.1) for natural language and tool orchestration
- Detects user intent and orchestrates multiple MCP tool calls for actionable insights
- Supports dynamic user input via CLI or interactive prompt
- Handles authentication via environment variable or .env file

## Tech Stack
- **Language:** Python 3.8+
- **AI/LLM:** Azure OpenAI (GPT-4.1 via azure-ai-inference)
- **DevOps Integration:** Azure DevOps MCP tools (via npx @azure-devops/mcp)
- **MCP Client:** mcp Python package
- **Async Operations:** asyncio, contextlib.AsyncExitStack
- **Environment Management:** python-dotenv (optional, for .env support)
- **CLI Parsing:** argparse
- **Other Libraries:**
  - re (regex intent detection)
  - json (tool argument serialization)
  - difflib (tool name suggestions)

## Usage
1. Install dependencies:
   ```sh
   pip install mcp azure-ai-inference python-dotenv
   ```
2. Set your Azure OpenAI API key in the environment or a `.env` file:
   ```sh
   export AZURE_AI_API_KEY=your-key-here
   # or create a .env file with AZURE_AI_API_KEY=your-key-here
   ```
3. Run the script:
   ```sh
   python -m AIToolkitDevops -m "Sprint insight for Sprint 42"
   ```
   Or run interactively and enter your queries at the prompt.

## Example Queries
- "Sprint insight for Sprint 42"
- "Code review insights in PR at VAIDMS project"
- "Sprint planning support"
- "Show real-time KPIs"

## Notes
- MCP tool names must match those exposed by your MCP server. Use the debug output to verify available tools.
- Project is designed for extensibility and can be adapted for other DevOps or AI-powered automation scenarios.
