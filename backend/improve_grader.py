with open('apps/grading/services/ai_symbolic_grader.py', 'r') as f:
    content = f.read()

# Find and replace the _grade_with_sympy method
old_method = '''    def _grade_with_sympy(
        self, 
        student_expr: str, 
        correct_expr: str,
        variables: Optional[Dict] = None
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
            
            return {
                'is_correct': is_correct,
                'confidence': 1.0 if is_correct else 0.0,
                'details': {
                    'student_simplified': str(student_simplified),
                    'correct_simplified': str(correct_simplified),
                    'difference': str(difference)
                }
            }
            
        except Exception as e:
            logger.warning(f"SymPy grading failed: {str(e)}")
            return {
                'is_correct': False,
                'confidence': 0.0,
                'details': {'error': str(e)}
            }'''

new_method = '''    def _grade_with_sympy(
        self, 
        student_expr: str, 
        correct_expr: str,
        variables: Optional[Dict] = None
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
                    from sympy import expand, simplify
                    expanded_diff = expand(student_simplified - correct_simplified)
                    simplified_diff = simplify(expanded_diff)
                    is_correct = simplified_diff == 0
                    
                    # Final fallback: numerical evaluation with multiple test points
                    if not is_correct and variables:
                        import random
                        matches = 0
                        tests = 5
                        for _ in range(tests):
                            test_vals = {k: random.uniform(0.1, 2.0) for k in variables.keys()}
                            try:
                                s_val = float(N(student_simplified.subs(test_vals)))
                                c_val = float(N(correct_simplified.subs(test_vals)))
                                if abs(s_val - c_val) < self.tolerance:
                                    matches += 1
                            except:
                                pass
                        is_correct = matches >= tests * 0.8  # 80% threshold
                except:
                    pass
            
            return {
                'is_correct': is_correct,
                'confidence': 1.0 if is_correct else 0.0,
                'details': {
                    'student_simplified': str(student_simplified),
                    'correct_simplified': str(correct_simplified),
                    'difference': str(difference)
                }
            }
            
        except Exception as e:
            logger.warning(f"SymPy grading failed: {str(e)}")
            return {
                'is_correct': False,
                'confidence': 0.0,
                'details': {'error': str(e)}
            }'''

content = content.replace(old_method, new_method)

with open('apps/grading/services/ai_symbolic_grader.py', 'w') as f:
    f.write(content)

print("✅ Grader improved with better numerical testing!")
