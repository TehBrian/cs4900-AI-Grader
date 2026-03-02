#Quickstart MCP test

from mcp.server.fastmcp import FastMCP

mcp_server = FastMCP("Test Server", json_response=True)

#Tools - 
@mcp_server.tool()
def add(a: int, b:int) -> int:
    """add two numbers"""
    return a + b

#Prompts -
@mcp_server.prompt()
def greet_user(name: str, style: str = "friendly") -> str:
    """Generate a greeting prompt"""
    styles = {
        "friendly": "Please write a warm, friendly greeting",
        "formal": "Please write a formal, professional greeting",
        "casual": "Please write a casual, relaxed greeting",
    }

    return f"{styles.get(style, styles[style])} for someone named {name}."


if __name__ == "__main__":
    mcp_server.run(transport="streamable-http")