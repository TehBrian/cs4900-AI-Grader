from sympy import sympify, simplify, Symbol
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

class SymbolicGrader:
    def grade(self, student_answer, correct_answer, tolerance=1e-10):
        try:
            student_expr = self._parse_expression(student_answer)
            correct_expr = self._parse_expression(correct_answer)
            
            # Simplify both expressions
            student_simple = simplify(student_expr)
            correct_simple = simplify(correct_expr)
            
            # Check if they're equal
            diff = simplify(student_simple - correct_simple)
            
            # For symbolic expressions, check if difference is zero
            if diff == 0:
                is_equivalent = True
            elif diff.is_number:
                is_equivalent = abs(float(diff)) < tolerance
            else:
                # Try substituting values to check numerical equivalence
                is_equivalent = False
            
            if is_equivalent:
                return {
                    'score': 100,
                    'correct': True,
                    'feedback': 'Mathematically equivalent! ✓',
                    'method': 'symbolic',
                    'details': {
                        'student': str(student_simple),
                        'expected': str(correct_simple)
                    }
                }
            else:
                return {
                    'score': 0,
                    'correct': False,
                    'feedback': 'Not mathematically equivalent.',
                    'method': 'symbolic',
                    'details': {
                        'student': str(student_simple),
                        'expected': str(correct_simple),
                        'difference': str(diff)
                    }
                }
        except Exception as e:
            return {
                'score': 0,
                'correct': False,
                'feedback': f'Error parsing expression: {str(e)}',
                'method': 'symbolic',
                'error': str(e)
            }
    
    def _parse_expression(self, expr_str):
        """Parse string to SymPy expression"""
        expr_str = str(expr_str).strip()
        
        # Replace common notations
        expr_str = expr_str.replace('^', '**')
        
        # For sinc function, just treat as a symbol for now
        # In a full implementation, you'd define sinc properly
        
        try:
            # Try standard parsing
            transformations = standard_transformations + (implicit_multiplication_application,)
            return parse_expr(expr_str, transformations=transformations)
        except:
            # Fallback: treat as sympify
            return sympify(expr_str)
