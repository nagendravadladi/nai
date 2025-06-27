import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizProps {
  onComplete: (score: number, stars: number) => void;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
    correctAnswer: 0,
    category: "Web Development"
  },
  {
    id: 2,
    question: "Which CSS property is used to change text color?",
    options: ["font-color", "text-color", "color", "foreground-color"],
    correctAnswer: 2,
    category: "Web Development"
  },
  {
    id: 3,
    question: "What is the correct way to declare a JavaScript variable?",
    options: ["variable myVar;", "v myVar;", "var myVar;", "declare myVar;"],
    correctAnswer: 2,
    category: "Programming"
  },
  {
    id: 4,
    question: "Which company developed React?",
    options: ["Google", "Microsoft", "Facebook", "Apple"],
    correctAnswer: 2,
    category: "Programming"
  },
  {
    id: 5,
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"],
    correctAnswer: 0,
    category: "Computer Science"
  },
  {
    id: 6,
    question: "Which programming language is known as the 'language of the web'?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: 2,
    category: "Programming"
  },
  {
    id: 7,
    question: "What is the purpose of Git?",
    options: ["Web hosting", "Version control", "Database management", "Image editing"],
    correctAnswer: 1,
    category: "Development Tools"
  },
  {
    id: 8,
    question: "Which HTTP status code indicates 'Not Found'?",
    options: ["200", "301", "404", "500"],
    correctAnswer: 2,
    category: "Web Development"
  }
];

export default function Quiz({ onComplete, onClose }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      handleNextQuestion();
    }
  }, [timeLeft, isPlaying, showResult]);

  const startQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameComplete(false);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setGameComplete(true);
      setIsPlaying(false);
      setShowResult(true);
    }
  };

  const finishQuiz = () => {
    const finalScore = score;
    const percentage = (finalScore / questions.length) * 100;
    
    let stars = 1;
    if (percentage >= 90) stars = 5;
    else if (percentage >= 75) stars = 4;
    else if (percentage >= 60) stars = 3;
    else if (percentage >= 40) stars = 2;
    
    onComplete(finalScore, stars);
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getTimeColor = () => {
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">Knowledge Quiz</h3>
        {isPlaying && (
          <div className="flex justify-center gap-4 text-sm">
            <span>Question {currentQuestion + 1}/{questions.length}</span>
            <span>Score: {score}</span>
            <span className={`font-bold ${getTimeColor()}`}>
              Time: {timeLeft}s
            </span>
          </div>
        )}
      </div>

      {!isPlaying && !gameComplete && (
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test your knowledge with {questions.length} questions
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Quiz Rules:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
              <li>• Each question has 30 seconds</li>
              <li>• Multiple choice questions</li>
              <li>• Categories: Web Dev, Programming, Computer Science</li>
              <li>• Score based on correct answers</li>
            </ul>
          </div>
          <Button onClick={startQuiz}>Start Quiz</Button>
        </div>
      )}

      {isPlaying && !gameComplete && (
        <div className="space-y-4">
          <Progress value={getProgressPercentage()} className="w-full" />
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {questions[currentQuestion].category}
              </span>
              <div className={`text-2xl font-bold ${getTimeColor()}`}>
                {timeLeft}
              </div>
            </div>
            <h4 className="font-medium text-lg mb-4">
              {questions[currentQuestion].question}
            </h4>
            
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="mr-3 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="min-w-24"
            >
              {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
            </Button>
            <Button variant="outline" onClick={finishQuiz}>
              End Quiz
            </Button>
          </div>
        </div>
      )}

      {gameComplete && showResult && (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-2">
            {score / questions.length >= 0.8 ? '🎉' : score / questions.length >= 0.6 ? '👏' : '📚'}
          </div>
          <h4 className="text-xl font-bold">Quiz Complete!</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {((score / questions.length) * 100).toFixed(0)}% Correct
            </p>
          </div>

          {/* Review incorrect answers */}
          <div className="text-left max-h-48 overflow-y-auto">
            <h5 className="font-medium text-sm mb-2">Review:</h5>
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.correctAnswer;
              
              if (isCorrect) return null;
              
              return (
                <div key={q.id} className="bg-red-50 dark:bg-red-900/20 rounded p-2 mb-2 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Correct: {q.options[q.correctAnswer]}
                  </p>
                  {userAnswer !== null && (
                    <p className="text-xs text-gray-500">
                      Your answer: {q.options[userAnswer]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={startQuiz}>Play Again</Button>
            <Button variant="outline" onClick={finishQuiz}>Finish</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
