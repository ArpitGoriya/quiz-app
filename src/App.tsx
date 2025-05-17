import { useState, useEffect } from 'react'
import './App.css'
import { questionBank, type Question } from './questionBank'
import Leaderboard from './Leaderboard'

const QUIZ_TIME = 40 // seconds

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [timeBonus, setTimeBonus] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME)
  const [timeUp, setTimeUp] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [userName, setUserName] = useState('You')

  // Extract unique categories
  const categories = Array.from(new Set(questionBank.map(q => q.category)));

  // Filter questions for selected category
  const questions = selectedCategory
    ? questionBank.filter(q => q.category === selectedCategory)
    : [];
  const currentQuestion: Question | undefined = questions[currentQuestionIdx];

  // Timer effect
  useEffect(() => {
    if (!selectedCategory || showSummary || timeUp || showLeaderboard) return;
    if (timeLeft <= 0) {
      setTimeUp(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [selectedCategory, timeLeft, showSummary, timeUp, showLeaderboard]);

  // Handlers
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentQuestionIdx(0)
    setSelectedOption(null)
    setShowAnswer(false)
    setIsCorrect(null)
    setScore(0)
    setFinalScore(0)
    setTimeBonus(0)
    setShowSummary(false)
    setTimeLeft(QUIZ_TIME)
    setTimeUp(false)
    setShowLeaderboard(false)
  }

  const handleOptionSelect = (option: string) => {
    if (showAnswer || timeUp) return;
    setSelectedOption(option)
    setShowAnswer(true)
    const correct = option === currentQuestion?.options[currentQuestion.correctIndex]
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
  }

  const handleNext = () => {
    setCurrentQuestionIdx(idx => idx + 1)
    setSelectedOption(null)
    setShowAnswer(false)
    setIsCorrect(null)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setCurrentQuestionIdx(0)
    setSelectedOption(null)
    setShowAnswer(false)
    setIsCorrect(null)
    setScore(0)
    setFinalScore(0)
    setTimeBonus(0)
    setShowSummary(false)
    setTimeLeft(QUIZ_TIME)
    setTimeUp(false)
    setShowLeaderboard(false)
  }

  const handleFinish = () => {
    // Only add time bonus if user finishes before time runs out
    const bonus = !timeUp ? timeLeft : 0;
    setTimeBonus(bonus)
    const total = score + bonus;
    setFinalScore(total)
    setShowSummary(true)
  }

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true)
  }

  // Render leaderboard
  if (showLeaderboard) {
    return (
      <Leaderboard userName={userName} userScore={finalScore} show={showLeaderboard} onBack={handleBackToCategories} />
    )
  }

  // Render time up popup
  if (timeUp) {
    return (
      <div className="quiz-section">
        <div className="timeup-modal">
          <div className="timeup-emoji">😢</div>
          <div className="timeup-title">Time's Up!</div>
          <div className="timeup-message">Oh no! You ran out of time.<br/>Better luck next time.</div>
          <button className="next-btn" onClick={handleBackToCategories}>Back to Categories</button>
        </div>
      </div>
    )
  }

  // Render summary page
  if (showSummary && selectedCategory) {
    return (
      <div className="quiz-section">
        <div className="summary-card">
          <h2 className="summary-title">Quiz Summary</h2>
          <div className="summary-score">You scored {score} out of {questions.length}</div>
          <div className="summary-score">Time Bonus: +{timeBonus}</div>
          <div className="summary-score">Final Score: <b>{finalScore}</b></div>
          <div className="summary-message">
            {finalScore === questions.length && '🎉 Perfect!'}
            {finalScore >= Math.ceil(questions.length * 0.7) && finalScore < questions.length && 'Great job!'}
            {finalScore < Math.ceil(questions.length * 0.7) && 'Keep practicing!'}
          </div>
          <button className="next-btn" onClick={handleShowLeaderboard}>View Leaderboard</button>
          <button className="next-btn" onClick={handleBackToCategories} style={{marginTop: '1rem'}}>Back to Categories</button>
        </div>
      </div>
    )
  }

  // Render quiz page
  if (selectedCategory && currentQuestion) {
    return (
      <div className="quiz-section">
        <button className="back-btn" onClick={handleBackToCategories}>&larr; Back</button>
        <div className="quiz-timer">Time Left: <span className={timeLeft <= 10 ? 'timer-warning' : ''}>{timeLeft}s</span></div>
        <div className="question-card">
          <div className="question-title">{currentQuestion.question}</div>
          <div className="options-list">
            {currentQuestion.options.map(option => {
              let optionClass = 'option-btn';
              if (showAnswer) {
                if (option === currentQuestion.options[currentQuestion.correctIndex]) optionClass += ' correct';
                else if (option === selectedOption) optionClass += ' wrong';
              }
              return (
                <button
                  key={option}
                  className={optionClass}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showAnswer}
                >
                  {option}
                </button>
              )
            })}
          </div>
          {showAnswer && (
            <div className={`answer-feedback ${isCorrect ? 'right' : 'wrong'}`}>{isCorrect ? 'Correct!' : 'Wrong!'}</div>
          )}
          <div className="quiz-controls">
            {showAnswer && currentQuestionIdx < questions.length - 1 && (
              <button className="next-btn" onClick={handleNext}>Next Question &rarr;</button>
            )}
            {showAnswer && currentQuestionIdx === questions.length - 1 && (
              <button className="next-btn" onClick={handleFinish}>Finish &rarr;</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render hero/category selection
  return (
    <div className="hero-section">
      <button className="leaderboard-top-btn" onClick={handleShowLeaderboard}>View Leaderboard</button>
      <h1 className="hero-title">Welcome to the Quiz App!</h1>
      <p className="hero-subtitle">Select a category to start your quiz</p>
      <div className="categories-container">
        {categories.map(category => (
          <div key={category} className="category-card" onClick={() => handleCategorySelect(category)}>
            <span>{category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
