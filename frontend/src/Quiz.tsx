import React, { useEffect, useState } from 'react';
import QuizTaking from './QuizTaking';

interface Quiz {
  id: number;
  title: string;
  course: number;
  course_name: string;
  time_limit: number;
  max_attempts: number;
  is_published: boolean;
  available_until: string;
  problem_count: number;
}

const QuizPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/quizzes/');
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        setError('Failed to fetch quizzes');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId: number) => {
    setActiveQuizId(quizId);
  };

  const handleBackToQuizzes = () => {
    setActiveQuizId(null);
  };

  // If a quiz is active, show the quiz-taking view
  if (activeQuizId !== null) {
    return <QuizTaking quizId={activeQuizId} onBack={handleBackToQuizzes} />;
  }

  // Otherwise, show the quiz list
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-center">Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">Available Quizzes</h1>
      
      {quizzes.length === 0 ? (
        <div className="rounded-2xl bg-white border shadow-sm p-6">
          <p className="text-gray-600">No quizzes available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="rounded-2xl bg-white border shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="h-2 bg-[#FFC72C]" />
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#4E3629]">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {quiz.course_name}
                    </p>
                  </div>
                  
                  {quiz.is_published && (
                    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                      Published
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">⏱️ Time Limit:</span>
                    <span>{quiz.time_limit} minutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">🔄 Max Attempts:</span>
                    <span>{quiz.max_attempts}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📝 Problems:</span>
                    <span>{quiz.problem_count}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📅 Available Until:</span>
                    <span>{new Date(quiz.available_until).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="mt-4 w-full px-4 py-2 rounded-full bg-[#4E3629] text-white font-semibold hover:opacity-95 transition"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage;
