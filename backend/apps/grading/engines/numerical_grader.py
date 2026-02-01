import re


class NumericalGrader:
    def grade(self, student_answer, correct_answer, tolerance=0.01, units=None):
        try:
            student_num = self._extract_number(student_answer)
            correct_num = self._extract_number(correct_answer)

            if student_num is None:
                return {
                    "score": 0,
                    "correct": False,
                    "feedback": "Could not parse number",
                    "method": "numerical",
                }

            error = (
                abs(student_num - correct_num) / abs(correct_num)
                if correct_num != 0
                else abs(student_num)
            )

            if error <= tolerance:
                return {
                    "score": 100,
                    "correct": True,
                    "feedback": "Correct! ✓",
                    "method": "numerical",
                }
            else:
                return {
                    "score": 0,
                    "correct": False,
                    "feedback": f"Expected {correct_num}, got {student_num}",
                    "method": "numerical",
                }
        except Exception as e:
            return {
                "score": 0,
                "correct": False,
                "feedback": f"Error: {str(e)}",
                "method": "numerical",
            }

    def _extract_number(self, text):
        text = str(text).strip()
        match = re.search(r"[-+]?\d*\.?\d+", text)
        return float(match.group()) if match else None
