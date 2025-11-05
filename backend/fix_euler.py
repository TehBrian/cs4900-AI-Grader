with open('apps/grading/services/ai_symbolic_grader.py', 'r') as f:
    content = f.read()

# Find the _clean_expression method and add 'e' to 'E' conversion
old_replacements = '''        # Common LaTeX to SymPy conversions
        replacements = [
            (r'\\frac\{([^}]+)\}\{([^}]+)\}', r'((\1)/(\2))'),  # Fractions
            (r'\\cdot', '*'),
            (r'\\times', '*'),
            (r'\\div', '/'),
            (r'\\sin', 'sin'),
            (r'\\cos', 'cos'),
            (r'\\tan', 'tan'),
            (r'\\ln', 'log'),
            (r'\\log', 'log'),
            (r'\\sqrt\{([^}]+)\}', r'sqrt(\1)'),
            (r'\\pi', 'pi'),
            (r'\\omega', 'omega'),
            (r'\\alpha', 'alpha'),
            (r'\\beta', 'beta'),
            (r'\\gamma', 'gamma'),
            (r'\\theta', 'theta'),
            (r'\\exp', 'exp'),
            (r'\^', '**'),  # Exponentiation
            (r'\\left', ''),
            (r'\\right', ''),
        ]'''

new_replacements = '''        # Common LaTeX to SymPy conversions
        replacements = [
            (r'\\frac\{([^}]+)\}\{([^}]+)\}', r'((\1)/(\2))'),  # Fractions
            (r'\\cdot', '*'),
            (r'\\times', '*'),
            (r'\\div', '/'),
            (r'\\sin', 'sin'),
            (r'\\cos', 'cos'),
            (r'\\tan', 'tan'),
            (r'\\ln', 'log'),
            (r'\\log', 'log'),
            (r'\\sqrt\{([^}]+)\}', r'sqrt(\1)'),
            (r'\\pi', 'pi'),
            (r'\\omega', 'omega'),
            (r'\\alpha', 'alpha'),
            (r'\\beta', 'beta'),
            (r'\\gamma', 'gamma'),
            (r'\\theta', 'theta'),
            (r'\\exp', 'exp'),
            (r'\^', '**'),  # Exponentiation
            (r'\\left', ''),
            (r'\\right', ''),
        ]
        
        # Convert e** to exp() for proper handling
        expr = re.sub(r'\be\*\*\(([^)]+)\)', r'exp(\1)', expr)
        expr = re.sub(r'\be\*\*([^\s\*\/\+\-\)]+)', r'exp(\1)', expr)'''

content = content.replace(old_replacements, new_replacements)

with open('apps/grading/services/ai_symbolic_grader.py', 'w') as f:
    f.write(content)

print("✅ Fixed Euler's number handling!")
