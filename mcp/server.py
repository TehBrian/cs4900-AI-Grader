#Import MCP server
from mcp.server.fastmcp import FastMCP

#Import tools
from tools.submissions import fetch_submission
from tools.grading import submit_grade

#Import resources /None yet so left blank

mcp = FastMCP("AI Symbolic Grader")

#Register tools

@mcp.tool()
def get_submission(submission_id: int, student_id : int):
       return fetch_submission(submission_id, student_id)

@mcp.tool()
def grade_submission(submission_id: int, student_id: int, score: float, feedback: str):
       return submit_grade(submission_id, student_id, score, feedback)

#Register Resources


def main():
       mcp.run(transport="streamable-http")

if __name__ == "__main__":
      main()