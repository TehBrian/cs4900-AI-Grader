import Levenshtein

class PatternGrader:
    def grade(self, student_answer, correct_answer, case_sensitive=True, allow_partial=True, partial_threshold=0.8):
        student = str(student_answer).strip()
        correct = str(correct_answer).strip()
        
        if not case_sensitive:
            student = student.lower()
            correct = correct.lower()
        
        if student == correct:
            return {'score': 100, 'correct': True, 'feedback': 'Exact match! ✓', 'method': 'pattern'}
        
        if allow_partial:
            similarity = self._calculate_similarity(student, correct)
            if similarity >= partial_threshold:
                score = int(similarity * 100)
                return {'score': score, 'correct': False, 'feedback': f'{similarity*100:.1f}% similar', 'method': 'pattern'}
        
        return {'score': 0, 'correct': False, 'feedback': 'Incorrect', 'method': 'pattern'}
    
    def _calculate_similarity(self, s1, s2):
        distance = Levenshtein.distance(s1, s2)
        max_len = max(len(s1), len(s2))
        return 1 - (distance / max_len) if max_len > 0 else 1.0
    
    def grade_sequence(self, student_answer, correct_answer, separator=','):
        student_seq = [s.strip() for s in str(student_answer).split(separator)]
        correct_seq = [s.strip() for s in str(correct_answer).split(separator)]
        
        if len(student_seq) != len(correct_seq):
            return {'score': 0, 'correct': False, 'feedback': f'Wrong length', 'method': 'pattern'}
        
        correct_count = sum(1 for s, c in zip(student_seq, correct_seq) if s == c)
        score = int((correct_count / len(correct_seq)) * 100)
        return {'score': score, 'correct': score == 100, 'feedback': f'{correct_count}/{len(correct_seq)} correct', 'method': 'pattern'}
