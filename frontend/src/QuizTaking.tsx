import React, { useEffect, useState } from 'react';

interface Problem {
  id: number;
  problem_order: number;
  points: number;
  problem_text: string;  // Changed from question_text
  solution_expression: string;
}

interface Quiz {
  id: number;
  title: string;
  course_name: string;
  time_limit: number;
  description: string;
}

interface QuizTakingProps {
  quizId: number;
  onBack: () => void;
}

const QuizTaking: React.FC<QuizTakingProps> = ({ quizId, onBack }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  useEffect(() => {
    if (timeRemaining > 0 && !submitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && quiz && !submitted) {
      handleSubmit();
    }
  }, [timeRemaining, submitted]);

  const fetchQuizDetails = async () => {
    try {
      // Fetch quiz details
      const quizResponse = await fetch(`http://127.0.0.1:8000/api/quizzes/${quizId}/`);
      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuiz(quizData);
        setTimeRemaining(quizData.time_limit * 60); // Convert minutes to seconds
      }

      // Fetch quiz problems
      const problemsResponse = await fetch(`http://127.0.0.1:8000/api/quizzes/${quizId}/problems/`);
      if (problemsResponse.ok) {
        const problemsData = await problemsResponse.json();
        setProblems(problemsData);
      }
    } catch (err) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (problemId: number, answer: string) => {
    setAnswers({
      ...answers,
      [problemId]: answer,
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Here you would submit answers to the backend
    alert('Quiz submitted! (Backend submission not implemented yet)');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-center">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-center text-red-600">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 mx-auto block px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white border shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Quiz Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been recorded. You can review your results once grading is complete.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-[#4E3629] text-white font-semibold hover:opacity-95 transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Quiz Header */}
      <div className="rounded-2xl bg-white border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{quiz.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{quiz.course_name}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-[#4E3629]'}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-xs text-gray-500">Time Remaining</p>
          </div>
        </div>
      </div>

      {/* Problems */}
      {problems.length === 0 ? (
        <div className="rounded-2xl bg-white border shadow-sm p-6">
          <p className="text-gray-600 text-center">This quiz has no problems yet.</p>
          <button
            onClick={onBack}
            className="mt-4 mx-auto block px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
          >
            Back to Quizzes
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {problems.map((problem, index) => (
              <div key={problem.id} className="rounded-2xl bg-white border shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FFC72C] flex items-center justify-center font-bold text-[#4E3629]">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-3">{problem.problem_text}</h3>
                    <input
                      type="text"
                      value={answers[problem.id] || ''}
                      onChange={(e) => handleAnswerChange(problem.id, e.target.value)}
                      placeholder="Enter your answer..."
                      className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 rounded-full bg-[#4E3629] text-white font-semibold hover:opacity-95 transition"
            >
              Submit Quiz
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizTaking;
