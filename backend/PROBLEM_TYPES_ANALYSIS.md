# Problem Types Analysis - CS4900 AI Grader

## Overview
Based on the uploaded PDF examples, the system needs to handle advanced electrical engineering problems, specifically in:
- Antenna Theory
- Communication Systems
- Signal Processing
- Error Correction Coding

---

## Problem Categories

### 1. **Symbolic Mathematics Problems**
**Characteristics:**
- Require symbolic manipulation
- Mathematical expressions as answers
- LaTeX formatting required
- May involve calculus, trigonometry, complex numbers

**Examples:**
- Fourier transforms
- Antenna far-field patterns
- Signal derivations

**Grading Approach:**
- Use SymPy for symbolic comparison
- Check mathematical equivalence (not just string matching)
- Allow multiple valid forms (e.g., sin²(x) = 1 - cos²(x))

**Implementation Needs:**
```python
# Example grading logic
from sympy import *
from sympy.parsing.latex import parse_latex

def grade_symbolic(student_answer, correct_answer):
    # Parse LaTeX expressions
    student_expr = parse_latex(student_answer)
    correct_expr = parse_latex(correct_answer)
    
    # Simplify and compare
    diff = simplify(student_expr - correct_expr)
    return diff == 0
```

---

### 2. **Multi-Step Derivation Problems**
**Characteristics:**
- Multiple intermediate steps
- Each step can be graded independently
- Partial credit possible
- Step-by-step verification needed

**Examples:**
- Proving P_max = D_max relationship
- Deriving antenna beam patterns
- Power density calculations

**Grading Approach:**
- Grade each step separately
- Award partial credit
- Check both final answer and methodology
- Provide feedback on specific steps

**Implementation Needs:**
```python
class MultiStepProblem:
    steps = [
        {"step": 1, "description": "Write definition for W_r", "points": 2},
        {"step": 2, "description": "Express U in terms of P", "points": 2},
        {"step": 3, "description": "Express P in terms of P_n", "points": 3},
        # ... more steps
    ]
    
    def grade_step(self, step_number, student_answer):
        # Grade individual step
        pass
```

---

### 3. **Numerical Calculation Problems**
**Characteristics:**
- Numerical answers with units
- Tolerance-based grading
- May require significant figures checking
- Unit conversion awareness

**Examples:**
- DSN temperature calculations (answer in Kelvin)
- Bit error rates
- Signal-to-noise ratios

**Grading Approach:**
- Allow tolerance (e.g., ±0.1%)
- Check units
- Verify significant figures
- Consider rounding errors

**Implementation Needs:**
```python
def grade_numerical(student_answer, correct_answer, tolerance=0.01, units=None):
    # Extract numerical value and units
    value, unit = parse_numerical_answer(student_answer)
    
    # Check if within tolerance
    if abs(value - correct_answer) / correct_answer <= tolerance:
        return True, "Correct"
    else:
        return False, f"Expected {correct_answer}{units}, got {value}{unit}"
```

---

### 4. **Diagram/Tree-Based Problems**
**Characteristics:**
- Visual problem solving
- Tree traversal (Viterbi coding)
- Path selection
- Binary sequence outputs

**Examples:**
- Viterbi encoding/decoding
- State machine diagrams

**Grading Approach:**
- Compare final binary sequences
- Check path validity
- May require step-by-step path verification

**Implementation Needs:**
```python
class ViterbiProblem:
    def grade_encoding(self, input_sequence, student_output):
        # Verify encoding is correct for given input
        expected = self.encode(input_sequence)
        return student_output == expected
    
    def grade_decoding(self, received_sequence, student_decoded):
        # Allow for error correction
        possible_original = self.decode(received_sequence)
        return student_decoded in possible_original
```

---

### 5. **Fill-in-the-Blank Problems**
**Characteristics:**
- Multiple blanks in a problem
- Each blank can be different type (symbolic, numerical, etc.)
- Context-dependent answers

**Examples:**
- "The solution to step 3 is: ______"
- "T_op1 = ______ K"

**Grading Approach:**
- Grade each blank independently
- Partial credit for each correct answer
- Type-specific grading per blank

---

## Grading Complexity Levels

### Level 1: **Exact Match**
- Binary sequences (Viterbi codes)
- Multiple choice selections
- Simple numerical values

### Level 2: **Tolerance-Based**
- Numerical answers with units
- Significant figures consideration
- Rounding tolerance

### Level 3: **Symbolic Equivalence**
- Mathematical expressions
- Multiple valid forms
- Symbolic manipulation needed

### Level 4: **AI-Assisted**
- Free-form explanations
- Derivation steps
- Conceptual understanding
- Natural language processing

---

## Required Libraries

### Mathematics
```bash
pip install sympy          # Symbolic mathematics
pip install numpy          # Numerical computations
pip install scipy          # Scientific computing
```

### LaTeX Parsing
```bash
pip install antlr4-python3-runtime  # For LaTeX parsing
```

### AI/NLP
```bash
pip install openai         # GPT API
pip install transformers   # For local NLP models
```

---

## Database Schema Additions Needed

### Problem Structure
```python
class Problem(models.Model):
    # Existing fields...
    
    # New fields for advanced problems
    problem_type = models.CharField(
        max_length=50,
        choices=[
            ('symbolic', 'Symbolic Math'),
            ('numerical', 'Numerical Calculation'),
            ('multi_step', 'Multi-Step Derivation'),
            ('viterbi', 'Viterbi Coding'),
            ('diagram', 'Diagram-Based'),
        ]
    )
    
    # For multi-step problems
    steps = models.JSONField(default=list)
    
    # For numerical problems
    answer_units = models.CharField(max_length=50, blank=True)
    tolerance_percent = models.FloatField(default=1.0)
    significant_figures = models.IntegerField(null=True, blank=True)
    
    # For symbolic problems
    allow_equivalent_forms = models.BooleanField(default=True)
    sympy_expression = models.TextField(blank=True)
```

### Grading Schema
```python
class Submission(models.Model):
    # Existing fields...
    
    # Step-by-step grading
    step_grades = models.JSONField(default=dict)
    
    # Detailed feedback
    ai_feedback = models.TextField(blank=True)
    symbolic_comparison = models.JSONField(null=True)
```

---

## API Endpoints Needed

### Problem Management
- `POST /api/problems/symbolic/` - Create symbolic math problem
- `POST /api/problems/multi-step/` - Create multi-step problem
- `POST /api/problems/numerical/` - Create numerical problem

### Grading
- `POST /api/grading/submit/` - Submit answer for grading
- `POST /api/grading/submit-step/` - Submit individual step
- `GET /api/grading/feedback/{submission_id}/` - Get detailed feedback

### AI Assistance
- `POST /api/ai/check-symbolic/` - Verify symbolic equivalence
- `POST /api/ai/provide-hint/` - Get AI-generated hint
- `POST /api/ai/grade-explanation/` - Grade free-form explanation

---

## Next Implementation Steps

1. **Create Problem Type Models** ✓
2. **Implement Symbolic Grading Engine** (SymPy integration)
3. **Build Multi-Step Grading System**
4. **Add Numerical Grading with Tolerance**
5. **Integrate OpenAI for AI-Assisted Grading**
6. **Create Problem Templates for Each Type**
7. **Build Grading API Endpoints**

---

**Priority**: Start with symbolic grading engine as it's the foundation for most problem types.
