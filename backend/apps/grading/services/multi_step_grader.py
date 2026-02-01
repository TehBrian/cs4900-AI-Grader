# backend/apps/grading/services/multi_step_grader.py
import os
import json
from typing import Dict, Any, List, Optional
from apps.grading.services.cas_grader import CASGrader

# Import OpenAI (we'll install this)
try:
    import openai

    openai.api_key = os.getenv("OPENAI_API_KEY", "")
    HAS_OPENAI = bool(openai.api_key)
except ImportError:
    HAS_OPENAI = False


class MultiStepGrader:
    """
    Advanced grader that evaluates:
    1. Step-by-step work (using GPT-4)
    2. Final answer (using CAS + GPT)
    3. Provides partial credit and detailed feedback
    """

    def __init__(self):
        self.cas_grader = CASGrader()
        self.has_openai = HAS_OPENAI

    def grade_submission(
        self,
        student_submission: str,
        problem_data: Dict[str, Any],
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Grade a complete student submission including work shown

        Args:
            student_submission: Complete text including steps and final answer
            problem_data: Problem definition with steps and correct solutions
            parameters: Student-specific parameter values

        Returns:
            Complete grading result with scores and feedback
        """
        result = {
            "total_score": 0.0,
            "max_score": 100.0,
            "step_scores": [],
            "final_answer_score": 0.0,
            "feedback": [],
            "grading_method": "hybrid",
            "confidence": 0.0,
        }

        # Parse student submission to extract steps and final answer
        parsed_submission = self._parse_submission(student_submission)

        # Grade final answer with CAS (primary method)
        final_answer_result = self._grade_final_answer(
            parsed_submission["final_answer"],
            problem_data["solution_expression"],
            parameters,
        )

        result["final_answer_score"] = final_answer_result["score"]
        result["feedback"].append(
            {
                "section": "Final Answer",
                "correct": final_answer_result["is_correct"],
                "feedback": final_answer_result["reasoning"],
                "confidence": final_answer_result["confidence"],
            }
        )

        # If OpenAI available, grade step-by-step work
        if self.has_openai and parsed_submission["work_shown"]:
            step_by_step_result = self._grade_work_shown(
                parsed_submission["work_shown"], problem_data, parameters
            )

            result["step_scores"] = step_by_step_result["step_scores"]
            result["feedback"].extend(step_by_step_result["feedback"])

            # Calculate total score
            # 70% final answer, 30% work shown
            work_score = sum(s["score"] for s in step_by_step_result["step_scores"])
            max_work_score = len(step_by_step_result["step_scores"]) * 100
            work_percentage = (
                (work_score / max_work_score * 100) if max_work_score > 0 else 0
            )

            result["total_score"] = (
                final_answer_result["score"] * 0.7 + work_percentage * 0.3
            )
            result["confidence"] = (
                final_answer_result["confidence"] * 0.7
                + step_by_step_result.get("confidence", 0.5) * 0.3
            )
        else:
            # No work shown or OpenAI not available - grade only final answer
            result["total_score"] = final_answer_result["score"]
            result["confidence"] = final_answer_result["confidence"]
            result["grading_method"] = "cas_only"

        return result

    def _parse_submission(self, submission: str) -> Dict[str, Any]:
        """
        Parse student submission to extract work shown and final answer

        Expected format:
        Step 1: ...
        Step 2: ...
        ...
        Final Answer: ... or just the answer on last line
        """
        lines = [line.strip() for line in submission.split("\n") if line.strip()]

        if not lines:
            return {"work_shown": [], "final_answer": ""}

        # Last line is typically the final answer
        final_answer = lines[-1]

        # Remove common prefixes from final answer
        for prefix in ["Final Answer:", "Answer:", "Final:", "Result:"]:
            if final_answer.startswith(prefix):
                final_answer = final_answer[len(prefix) :].strip()

        # Everything else is work shown
        work_shown = lines[:-1] if len(lines) > 1 else []

        return {"work_shown": work_shown, "final_answer": final_answer}

    def _grade_final_answer(
        self, student_answer: str, correct_answer: str, parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Grade the final answer using CAS"""
        cas_result = self.cas_grader.grade_expression(
            student_answer, correct_answer, None
        )

        return {
            "is_correct": cas_result.get("is_correct", False),
            "score": 100.0 if cas_result.get("is_correct") else 0.0,
            "confidence": cas_result.get("confidence", 0.0),
            "reasoning": cas_result.get("reasoning", "Unable to evaluate"),
            "method": "cas",
        }

    def _grade_work_shown(
        self,
        work_lines: List[str],
        problem_data: Dict[str, Any],
        parameters: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Use GPT-4 to evaluate step-by-step work
        """
        if not self.has_openai:
            return {"step_scores": [], "feedback": [], "confidence": 0.0}

        # Prepare prompt for GPT-4
        prompt = self._build_gpt_prompt(work_lines, problem_data, parameters)

        try:
            from openai import OpenAI

            client = OpenAI(api_key=openai.api_key)

            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert engineering professor grading student work.
                        Evaluate the student's step-by-step solution for correctness and methodology.
                        Provide constructive feedback and partial credit where appropriate.
                        Return your response as JSON.""",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1500,
            )

            result = json.loads(response.choices[0].message.content)
            return self._process_gpt_response(result)

        except Exception as e:
            print(f"GPT grading error: {str(e)}")
            return {
                "step_scores": [],
                "feedback": [
                    {
                        "section": "Work Evaluation",
                        "feedback": "Unable to evaluate work shown",
                    }
                ],
                "confidence": 0.0,
            }

    def _build_gpt_prompt(
        self,
        work_lines: List[str],
        problem_data: Dict[str, Any],
        parameters: Dict[str, Any],
    ) -> str:
        """Build the prompt for GPT-4 evaluation"""

        prompt = f"""
        Evaluate this student's step-by-step solution to an engineering problem.
        
        PROBLEM:
        {problem_data.get('question_text', '')}
        
        GIVEN PARAMETERS:
        {json.dumps(parameters, indent=2)}
        
        CORRECT SOLUTION STEPS:
        {problem_data.get('solution_explanation', 'Not provided')}
        
        STUDENT'S WORK:
        {chr(10).join(f"{i+1}. {line}" for i, line in enumerate(work_lines))}
        
        EVALUATION CRITERIA:
        1. Is the student's approach correct?
        2. Are the mathematical manipulations valid?
        3. Did they use the given parameters correctly?
        4. Are there any conceptual errors?
        5. Does the work logically lead to their final answer?
        
        Provide your evaluation as JSON with this structure:
        {{
            "overall_assessment": "brief summary",
            "step_evaluations": [
                {{
                    "step_number": 1,
                    "is_correct": true/false,
                    "score": 0-100,
                    "feedback": "specific feedback for this step"
                }}
            ],
            "strengths": ["list of what student did well"],
            "errors": ["list of mistakes or misconceptions"],
            "suggestions": ["how to improve"],
            "partial_credit_justification": "why partial credit was awarded",
            "confidence": 0.0-1.0
        }}
        """

        return prompt

    def _process_gpt_response(self, gpt_result: Dict) -> Dict[str, Any]:
        """Process GPT-4 response into standardized format"""

        step_scores = []
        feedback = []

        # Process each step evaluation
        for step_eval in gpt_result.get("step_evaluations", []):
            step_scores.append(
                {
                    "step_number": step_eval.get("step_number", 0),
                    "score": step_eval.get("score", 0),
                    "is_correct": step_eval.get("is_correct", False),
                }
            )

            feedback.append(
                {
                    "section": f"Step {step_eval.get('step_number', 0)}",
                    "correct": step_eval.get("is_correct", False),
                    "feedback": step_eval.get("feedback", ""),
                }
            )

        # Add overall feedback
        if gpt_result.get("overall_assessment"):
            feedback.insert(
                0,
                {
                    "section": "Overall Assessment",
                    "feedback": gpt_result["overall_assessment"],
                },
            )

        # Add strengths and areas for improvement
        if gpt_result.get("strengths"):
            feedback.append(
                {"section": "Strengths", "feedback": ", ".join(gpt_result["strengths"])}
            )

        if gpt_result.get("errors"):
            feedback.append(
                {
                    "section": "Areas to Improve",
                    "feedback": ", ".join(gpt_result["errors"]),
                }
            )

        return {
            "step_scores": step_scores,
            "feedback": feedback,
            "confidence": gpt_result.get("confidence", 0.8),
        }


# Helper function to format grading result for display
def format_grading_result(result: Dict[str, Any]) -> str:
    """Format grading result for human-readable display"""

    output = []
    output.append("=" * 70)
    output.append(f"GRADING RESULTS")
    output.append("=" * 70)
    output.append(
        f"\nTotal Score: {result['total_score']:.1f}/{result['max_score']:.1f}"
    )
    output.append(f"Grading Method: {result['grading_method'].upper()}")
    output.append(f"Confidence: {result['confidence']:.1%}")

    if result.get("step_scores"):
        output.append(f"\n{'Step-by-Step Scores:':}")
        for step in result["step_scores"]:
            status = "✓" if step["is_correct"] else "✗"
            output.append(
                f"  {status} Step {step['step_number']}: {step['score']:.0f}/100"
            )

    output.append(f"\n{'Feedback:':}")
    for fb in result["feedback"]:
        section = fb.get("section", "General")
        feedback_text = fb.get("feedback", "")
        correct = fb.get("correct")

        if correct is not None:
            status = "✓" if correct else "✗"
            output.append(f"\n{status} {section}:")
        else:
            output.append(f"\n{section}:")

        output.append(f"  {feedback_text}")

    output.append("\n" + "=" * 70)

    return "\n".join(output)
