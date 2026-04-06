from pathlib import Path

#Import MCP server
from mcp.server import FastMCP
from mcp.server.fastmcp import Image

#Import tools
from tools.submissions import fetch_submission
from tools.grading import submit_grade
#from tools.grading import send_answers


mcp = FastMCP("AI Symbolic Grader", json_response=True, stateless_http = True)
BASE_PATH = Path.cwd()
RUBRIC_PATH = BASE_PATH / "resources" / "rubrics" 


#Register tools

@mcp.tool()
def get_submission(submission_id: int, student_id : int):
       return fetch_submission(submission_id, student_id)

@mcp.tool()
def grade_submission(score: float, feedback: str):
       return submit_grade(score, feedback)

#Register Resources
@mcp.resource("dir://rubrics")
def list_rubrics() -> list[str]:
       return[str(f) for f in RUBRIC_PATH.iterdir()]
       

@mcp.resource("file://{file_name}/")
def get_rubric(file_name: str) -> str | bytes:
       file_path = RUBRIC_PATH / file_name
       try:
              if file_name.lower().endswith('.pdf'):
                     return file_path.read_bytes()
              else:
                     return file_path.read_text()
       except FileNotFoundError:
              if file_name.lower().endswith('.pdf'):
                     return "PDF not found."
              else: return "File not found"

@mcp.prompt()


def main():
       mcp.run(transport="streamable-http")

if __name__ == "__main__":
      main()