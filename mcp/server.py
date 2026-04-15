from pathlib import Path

#Import MCP server modules
from mcp.server.fastmcp import FastMCP, Context
from mcp.server.session import ServerSession
from mcp.types import SamplingMessage, TextContent, CallToolResult
import json

#Import tools
from tools.submissions import fetch_submission
from tools.quiz import fetch_quiz
from tools.grading import submit_grade
#from tools.grading import send_answers


mcp = FastMCP("AI Symbolic Grader", json_response=True, stateless_http = True)
BASE_PATH = Path.cwd()
RUBRIC_PATH = BASE_PATH / "resources" / "rubrics" 


#Register tools

@mcp.tool("Get_submission_using_student_ID")
async def get_submission_quiz(student_id: int):
       submission = fetch_submission(student_id)
       return  CallToolResult(  
              content=[TextContent(type="text", text=str(submission.__dict__))],  
              structuredContent={  
                  "submission_id": submission.submission_id,  
                  "quiz_id": submission.quiz_id,
                  "student_id" : submission.student_id,
                  "student_answers": submission.student_answers 
              }  
       )  

@mcp.tool("Get_quiz_using_quiz_ID")
async def get_quiz(quiz_id: int):
       quiz = fetch_quiz(quiz_id)
       return CallToolResult(
              content=[TextContent(type="text", text=str(quiz.__dict__))],
              structuredContent={
                     "quiz_id": quiz.quiz_id,
                     "problems": quiz.problems,
                     "title": quiz.title,
                     "course": quiz.course
              }
       )

@mcp.tool()
def grade_submission(submission_id, student_name:str, score: float, feedback: str):
       return submit_grade(submission_id, student_name, score, feedback)

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

@mcp.tool()
async def grade_quiz_submission(student_id: int, ctx: Context[ServerSession, None]) -> str:
       #Grade a quiz submission using AI.

       #fetch required data
       submission_result = await ctx.fastmcp.call_tool("Get_submission_using_student_ID", {"student_id": student_id})
       quiz_data_result = await ctx.fastmcp.call_tool("Get_quiz_using_quiz_ID", {"quiz_id": submission_result.structuredContent.get("quiz_id")})
       
       #Set structured data to another variable
       submission_struct = submission_result.structuredContent
       quiz_struct = quiz_data_result.structuredContent


       #Grading prompt
       grading_prompt = f"""
       Please grade the following quiz submission. For each problem solve the problem based on the question_text field and then grade the students answers against your answers.
       Your answer will be the correct answer in each case.
       The students answers and the problems are already in the same order.

       Student Submission:
       {json.dumps(submission_struct, indent=2)}

       Quiz Problems:
       {json.dumps(quiz_struct, indent=2)}

       For each problem, provide:
       1. Problem ID
       2. Student's answer
       3. Solved answer
       4. Score (0 or points available)
       5. Brief feedback

       Return the results as a JSON array with this structure:
       [
              {{
                     "problem_id": 1,
                     "student_answer": "student's answer",
                     "solved_answer": "solved answer",
                     "score": 1.0,
                     "max_points": 1.0,
                     "feedback": Brief feedback on the answer"
              }}

       ]
       """
       
       #Use sampling to grade the submission
       result = await ctx.session.create_message(
              messages=[
                     SamplingMessage(
                            role = "user",
                            content = TextContent(type="text", text = grading_prompt),
                     )
              ], max_tokens=1000,
       )

       return result.content.text if result.content.type == "text" else str(result.content)





def main():
       mcp.run(transport="streamable-http")

if __name__ == "__main__":
      main()