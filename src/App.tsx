import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { questionBank, type Question } from './questionBank'

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [showSummary, setShowSummary] = useState(false)

  // Extract unique categories
  const categories = Array.from(new Set(questionBank.map(q => q.category)));

  // Filter questions for selected category
  const questions = selectedCategory
    ? questionBank.filter(q => q.category === selectedCategory)
    : [];
  const currentQuestion: Question | undefined = questions[currentQuestionIdx];

  // Handlers
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentQuestionIdx(0)
    setSelectedOption(null)
    setShowAnswer(false)
    setIsCorrect(null)
    setScore(0)
    setShowSummary(false)
  }

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedOption(option)
    setShowAnswer(true)
    const correct = option === currentQuestion?.answer
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
    setShowSummary(false)
  }

  const handleFinish = () => {
    setShowSummary(true)
  }

  // Render summary page
  if (showSummary && selectedCategory) {
    return (
      <div className="quiz-section">
        <div className="summary-card">
          <h2 className="summary-title">Quiz Summary</h2>
          <div className="summary-score">You scored {score} out of {questions.length}</div>
          <div className="summary-message">
            {score === questions.length && '🎉 Perfect!'}
            {score >= Math.ceil(questions.length * 0.7) && score < questions.length && 'Great job!'}
            {score < Math.ceil(questions.length * 0.7) && 'Keep practicing!'}
          </div>
          <button className="next-btn" onClick={handleBackToCategories}>Back to Categories</button>
        </div>
      </div>
    )
  }

  // Render quiz page
  if (selectedCategory && currentQuestion) {
    return (
      <div className="quiz-section">
        <button className="back-btn" onClick={handleBackToCategories}>&larr; Back</button>
        <div className="question-card">
          <div className="question-title">{currentQuestion.question}</div>
          <div className="options-list">
            {currentQuestion.options.map(option => {
              let optionClass = 'option-btn';
              if (showAnswer) {
                if (option === currentQuestion.answer) optionClass += ' correct';
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
