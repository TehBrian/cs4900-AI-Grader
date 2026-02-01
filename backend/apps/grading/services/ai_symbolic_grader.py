# apps/grading/services/ai_symbolic_grader.py
"""
AI-powered symbolic expression grading service
Uses OpenAI GPT-4 and SymPy for mathematical equivalency checking
Integrates with the existing grading system
"""

import re
import logging
import os
from typing import Dict, Tuple, Optional, List
from sympy import sympify, simplify, N, symbols
from sympy.parsing.latex import parse_latex
from django.conf import settings

logger = logging.getLogger(__name__)

# Try to import OpenAI
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI not installed. AI grading will be disabled.")


class AISymbolicGrader:
    """
    AI-powered symbolic grading service combining OpenAI GPT-4 and SymPy

    This grader uses multiple methods to determine if a student's answer
    is mathematically equivalent to the correct answer:
    1. SymPy symbolic comparison
    2. Numerical evaluation with random values
    3. OpenAI GPT-4 AI analysis (if API key available)
    """

    def __init__(self):
        # Get OpenAI settings from environment or Django settings
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        if hasattr(settings, "OPENAI_API_KEY"):
            self.openai_api_key = settings.OPENAI_API_KEY

        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        if hasattr(settings, "OPENAI_MODEL"):
            self.model = settings.OPENAI_MODEL

        self.tolerance = 1e-5  # Numerical tolerance
        self.use_ai = OPENAI_AVAILABLE and bool(self.openai_api_key)

        if self.use_ai:
            openai.api_key = self.openai_api_key
            logger.info("AI grading enabled with OpenAI")
        else:
            logger.info("AI grading disabled - using SymPy only")

    def grade_expression(
        self,
        student_answer: str,
        correct_answer: str,
        variables: Optional[Dict[str, float]] = None,
        tolerance: Optional[float] = None,
    ) -> Dict:
        """
        Grade a symbolic expression using multiple methods

        Args:
            student_answer: Student's submitted answer (LaTeX or plain text)
            correct_answer: Correct answer (LaTeX or plain text)
            variables: Dictionary of variable values for substitution
            tolerance: Numerical tolerance (default: 1e-6)

        Returns:
            Dictionary with grading results:
            {
                'is_correct': bool,
                'score': float (0.0 to 1.0),
                'feedback': str,
                'method_used': str,
                'confidence': float,
                'details': dict
            }
        """
        if tolerance is not None:
            self.tolerance = tolerance

        try:
            # Clean and normalize expressions
            student_expr = self._clean_expression(student_answer)
            correct_expr = self._clean_expression(correct_answer)

            logger.info(
                f"Grading - Student: '{student_expr}' vs Correct: '{correct_expr}'"
            )

            # Try multiple grading methods
            results = []

            # Method 1: Direct SymPy comparison (most reliable)
            sympy_result = self._grade_with_sympy(student_expr, correct_expr, variables)
            results.append(("sympy_direct", sympy_result))

            # Method 2: Numerical evaluation
            if variables:
                numerical_result = self._grade_numerical(
                    student_expr, correct_expr, variables
                )
                results.append(("numerical", numerical_result))

            # Method 3: AI grading (if available)
            if self.use_ai:
                try:
                    ai_result = self._grade_with_ai(student_expr, correct_expr)
                    results.append(("ai", ai_result))
                except Exception as e:
                    logger.warning(f"AI grading failed: {str(e)}")

            # Combine results
            final_result = self._combine_results(results)

            return {
                "is_correct": final_result["is_correct"],
                "score": final_result["score"],
                "feedback": final_result["feedback"],
                "method_used": final_result["method"],
                "confidence": final_result.get("confidence", final_result["score"]),
                "details": {
                    "all_methods": results,
                    "student_expression": student_expr,
                    "correct_expression": correct_expr,
                    "variables": variables,
                },
            }

        except Exception as e:
            logger.error(f"Error grading expression: {str(e)}", exc_info=True)
            return {
                "is_correct": False,
                "score": 0.0,
                "feedback": f"Error processing answer: {str(e)}",
                "method_used": "error",
                "confidence": 0.0,
                "details": {"error": str(e)},
            }

    def _clean_expression(self, expr: str) -> str:
        """Clean and normalize mathematical expression"""
        if not expr:
            return ""

        # Remove extra whitespace
        expr = " ".join(expr.split())

        # Common LaTeX to SymPy conversions
        replacements = [
            (r"\\frac\{([^}]+)\}\{([^}]+)\}", r"((\1)/(\2))"),  # Fractions
            (r"\\cdot", "*"),
            (r"\\times", "*"),
            (r"\\div", "/"),
            (r"\\sin", "sin"),
            (r"\\cos", "cos"),
            (r"\\tan", "tan"),
            (r"\\ln", "log"),
            (r"\\log", "log"),
            (r"\\sqrt\{([^}]+)\}", r"sqrt(\1)"),
            (r"\\pi", "pi"),
            (r"\\omega", "omega"),
            (r"\\alpha", "alpha"),
            (r"\\beta", "beta"),
            (r"\\gamma", "gamma"),
            (r"\\theta", "theta"),
            (r"\\exp", "exp"),
            (r"\^", "**"),  # Exponentiation
            (r"\\left", ""),
            (r"\\right", ""),
        ]

        for pattern, replacement in replacements:
            expr = re.sub(pattern, replacement, expr)

        # Remove remaining backslashes
        expr = expr.replace("\\", "")

        # Convert e** to exp for proper SymPy handling
        expr = re.sub(r"\be\*\*", "exp", expr)

        # Handle implicit multiplication (e.g., "2x" -> "2*x")
        expr = re.sub(r"(\d)([a-zA-Z])", r"\1*\2", expr)
        expr = re.sub(r"\)([a-zA-Z])", r")*\1", expr)
        expr = re.sub(r"([0-9])\(", r"\1*(", expr)

        return expr.strip()

    def _grade_with_sympy(
        self, student_expr: str, correct_expr: str, variables: Optional[Dict] = None
    ) -> Dict:
        """Grade using SymPy symbolic mathematics"""
        try:
            # Parse expressions
            student_sym = sympify(student_expr)
            correct_sym = sympify(correct_expr)

            # Simplify both
            student_simplified = simplify(student_sym)
            correct_simplified = simplify(correct_sym)

            # Check symbolic equality
            difference = simplify(student_simplified - correct_simplified)
            is_correct = difference == 0

            # If not symbolically equal, try numerical comparison
            if not is_correct and variables:
                try:
                    student_val = float(N(student_simplified.subs(variables)))
                    correct_val = float(N(correct_simplified.subs(variables)))
                    is_correct = abs(student_val - correct_val) < self.tolerance
                except:
                    pass

            # If still not equal, try expanding and simplifying the difference
            if not is_correct:
                try:
                    from sympy import expand

                    expanded_diff = expand(student_simplified - correct_simplified)
                    simplified_diff = simplify(expanded_diff)
                    is_correct = simplified_diff == 0

                    # Final fallback: numerical evaluation with multiple test points
                    if not is_correct and variables:
                        import random

                        matches = 0
                        tests = 5
                        for _ in range(tests):
                            test_vals = {
                                k: random.uniform(0.1, 2.0) for k in variables.keys()
                            }
                            try:
                                s_val = float(N(student_simplified.subs(test_vals)))
                                c_val = float(N(correct_simplified.subs(test_vals)))
                                if abs(s_val - c_val) < self.tolerance:
                                    matches += 1
                            except:
                                pass
                        is_correct = matches >= tests * 0.7  # 80% threshold
                except:
                    pass

            return {
                "is_correct": is_correct,
                "confidence": 1.0 if is_correct else 0.0,
                "details": {
                    "student_simplified": str(student_simplified),
                    "correct_simplified": str(correct_simplified),
                    "difference": str(difference),
                },
            }

        except Exception as e:
            logger.warning(f"SymPy grading failed: {str(e)}")
            return {
                "is_correct": False,
                "confidence": 0.0,
                "details": {"error": str(e)},
            }

    def _grade_numerical(
        self, student_expr: str, correct_expr: str, variables: Dict
    ) -> Dict:
        """Grade by numerical evaluation with multiple test values"""
        try:
            import random

            student_sym = sympify(student_expr)
            correct_sym = sympify(correct_expr)

            # Test with multiple random values
            test_count = 10
            matches = 0

            var_symbols = list(variables.keys())

            for _ in range(test_count):
                # Generate random test values
                test_values = {var: random.uniform(-10, 10) for var in var_symbols}

                try:
                    # Evaluate both expressions
                    student_val = float(N(student_sym.subs(test_values)))
                    correct_val = float(N(correct_sym.subs(test_values)))

                    # Check if they match within tolerance
                    if abs(student_val - correct_val) < self.tolerance:
                        matches += 1
                except:
                    continue

            # Consider correct if >90% of tests match
            confidence = matches / test_count
            is_correct = confidence >= 0.9

            return {
                "is_correct": is_correct,
                "confidence": confidence,
                "details": {
                    "tests_passed": f"{matches}/{test_count}",
                    "pass_rate": confidence,
                },
            }

        except Exception as e:
            logger.warning(f"Numerical grading failed: {str(e)}")
            return {
                "is_correct": False,
                "confidence": 0.0,
                "details": {"error": str(e)},
            }

    def _grade_with_ai(self, student_expr: str, correct_expr: str) -> Dict:
        """Grade using OpenAI GPT-4"""
        try:
            prompt = f"""You are a mathematics professor grading student answers.

Determine if these two mathematical expressions are equivalent:

Student Answer: {student_expr}
Correct Answer: {correct_expr}

Consider:
1. Algebraic equivalence
2. Different but equivalent forms (e.g., 1/2 = 0.5, e^(-x) = 1/e^x)
3. Reordered terms
4. Different notation

Respond with ONLY a JSON object:
{{
    "is_equivalent": true or false,
    "confidence": 0.0 to 1.0,
    "explanation": "brief explanation"
}}"""

            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise mathematics grading assistant. Always respond with valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.1,
                max_tokens=200,
            )

            # Parse AI response
            import json

            ai_response = response.choices[0].message.content.strip()

            # Extract JSON from response (in case there's extra text)
            json_match = re.search(r"\{.*\}", ai_response, re.DOTALL)
            if json_match:
                ai_response = json_match.group(0)

            result = json.loads(ai_response)

            return {
                "is_correct": result.get("is_equivalent", False),
                "confidence": result.get("confidence", 0.5),
                "details": {
                    "ai_explanation": result.get("explanation", ""),
                    "raw_response": ai_response,
                },
            }

        except Exception as e:
            logger.error(f"AI grading failed: {str(e)}")
            return {
                "is_correct": False,
                "confidence": 0.0,
                "details": {"error": str(e)},
            }

    def _combine_results(self, results: List[Tuple[str, Dict]]) -> Dict:
        """Combine results from multiple grading methods"""
        # Weight different methods
        weights = {"sympy_direct": 0.5, "numerical": 0.3, "ai": 0.2}

        total_score = 0.0
        total_weight = 0.0
        methods_used = []
        max_confidence = 0.0

        for method, result in results:
            confidence = result.get("confidence", 0.0)
            if confidence > 0:
                weight = weights.get(method, 0.1)
                score = confidence if result.get("is_correct", False) else 0.0
                total_score += score * weight
                total_weight += weight
                methods_used.append(method)
                max_confidence = max(max_confidence, confidence)

        # Calculate final score
        final_score = total_score / total_weight if total_weight > 0 else 0.0
        is_correct = final_score >= 0.6  # 60% threshold

        # Generate feedback
        if is_correct:
            feedback = "Correct! Your answer is mathematically equivalent to the expected solution."
        else:
            feedback = "Incorrect. Please check your work and try again."

        return {
            "is_correct": is_correct,
            "score": final_score,
            "confidence": max_confidence,
            "feedback": feedback,
            "method": ", ".join(methods_used) if methods_used else "none",
        }


# Convenience function for easy import
def grade_symbolic_expression(
    student_answer: str, correct_answer: str, variables: Optional[Dict] = None
) -> Dict:
    """
    Convenience function to grade a symbolic expression

    Usage:
        from apps.grading.services.ai_symbolic_grader import grade_symbolic_expression

        result = grade_symbolic_expression(
            student_answer="0.5*e**(-x)*cos(2*x)",
            correct_answer="(1/2)*exp(-x)*cos(2*x)",
            variables={'x': 1.0}
        )

        print(f"Correct: {result['is_correct']}")
        print(f"Score: {result['score']}")
        print(f"Feedback: {result['feedback']}")
    """
    grader = AISymbolicGrader()
    return grader.grade_expression(student_answer, correct_answer, variables)
