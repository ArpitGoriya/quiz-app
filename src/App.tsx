import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'
import { questionBank, type Question } from './questionBank'
import Leaderboard from './Leaderboard'
import Calculator from './Calculator'
import Summary from './Summary'
import { motion } from 'framer-motion'

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
  const [showCalc, setShowCalc] = useState(false)
  const [feedbackIcon, setFeedbackIcon] = useState<string | null>(null)
  const [cardFadeOut, setCardFadeOut] = useState(false)
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [answerStates, setAnswerStates] = useState<(null | 'right' | 'wrong')[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [resultsStage, setResultsStage] = useState<'stats' | 'transition' | 'review'>('stats');
  const [revealedStats, setRevealedStats] = useState(0); // 0: none, 1: score, 2: bonus, 3: final, 4: message
  const [revealedMistakes, setRevealedMistakes] = useState(0);

  // Extract unique categories and make 'Math & Logic' second
  let categories = Array.from(new Set(questionBank.map(q => q.category)));
  const mathIdx = categories.findIndex(cat => /math\s*&\s*logic/i.test(cat));
  if (mathIdx > -1 && mathIdx !== 1) {
    const [mathCat] = categories.splice(mathIdx, 1);
    categories.splice(1, 0, mathCat);
  }

  // Filter questions for selected category
  const questions = useMemo(() => (
    selectedCategory
      ? questionBank.filter(q => q.category === selectedCategory)
      : []
  ), [selectedCategory]);
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

  // Auto-advance effect with fade-out
  useEffect(() => {
    if (showAnswer && selectedOption && !showSummary && !timeUp) {
      setFeedbackIcon(isCorrect ? 'right' : 'wrong')
      setCardFadeOut(false)
      feedbackTimeout.current && clearTimeout(feedbackTimeout.current)
      feedbackTimeout.current = setTimeout(() => {
        setCardFadeOut(true)
        setTimeout(() => {
          setFeedbackIcon(null)
          setCardFadeOut(false)
          if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(idx => idx + 1)
            setSelectedOption(null)
            setShowAnswer(false)
            setIsCorrect(null)
          } else {
            handleFinish()
          }
        }, 350)
      }, 1100)
    }
    return () => { if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current); }
  }, [showAnswer, selectedOption, isCorrect, currentQuestionIdx, questions.length, showSummary, timeUp])

  // Reset answerStates when starting a new quiz
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
    setAnswerStates(Array(questionBank.filter(q => q.category === cat).length).fill(null))
    setUserAnswers([])
  }

  // Update answerStates when an answer is selected
  useEffect(() => {
    if (showAnswer && selectedOption && !showSummary && !timeUp) {
      setAnswerStates(prev => {
        const arr = [...prev]
        arr[currentQuestionIdx] = isCorrect ? 'right' : 'wrong'
        return arr
      })
    }
    // eslint-disable-next-line
  }, [showAnswer, selectedOption])

  // Handlers
  const handleOptionSelect = (option: string) => {
    if (showAnswer || timeUp) return;
    setSelectedOption(option)
    setShowAnswer(true)
    const correct = option === currentQuestion?.options[currentQuestion.correctIndex]
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    setUserAnswers(prev => {
      const arr = [...prev]
      arr[currentQuestionIdx] = option
      return arr
    })
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
    setUserAnswers([])
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

  // When quiz ends, start the results animation flow
  useEffect(() => {
    if (showSummary && selectedCategory) {
      setResultsStage('stats');
      setRevealedStats(0);
      setRevealedMistakes(0);
      // Reveal stats one by one, slower
      let timers: ReturnType<typeof setTimeout>[] = [];
      for (let i = 1; i <= 4; i++) {
        timers.push(setTimeout(() => setRevealedStats(i), i * 1000));
      }
      // After stats, pause, then transition to review
      timers.push(setTimeout(() => setResultsStage('transition'), 5000)); // 4s for stats, 1s pause
      // Only after slide, show review
      timers.push(setTimeout(() => setResultsStage('review'), 6500)); // 1.5s for slide
      return () => timers.forEach(clearTimeout);
    }
  }, [showSummary, selectedCategory]);

  // Reveal mistakes one by one in review stage, slower
  useEffect(() => {
    if (resultsStage === 'review' && showSummary && selectedCategory) {
      setRevealedMistakes(0);
      const wrongCount = questions.filter((_, idx) => answerStates[idx] === 'wrong').length;
      if (wrongCount === 0) return;
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setRevealedMistakes(i);
        if (i >= wrongCount) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [resultsStage, showSummary, selectedCategory]);

  // Handler for retrying the same quiz
  const handleRetryThisQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setIsCorrect(null);
    setScore(0);
    setFinalScore(0);
    setTimeBonus(0);
    setShowSummary(false);
    setTimeLeft(QUIZ_TIME);
    setTimeUp(false);
    setAnswerStates(Array(questions.length).fill(null));
    setUserAnswers([]);
  };

  // Render leaderboard
  if (showLeaderboard) {
    return (
      <div className="quiz-section">
        <div className="hero-bg-shape shape1"></div>
        <div className="hero-bg-shape shape2"></div>
        <div className="hero-bg-shape shape3"></div>
        <div className="hero-bg-shape shape4"></div>
        <div className="hero-bg-shape shape5"></div>
      <Leaderboard userName={userName} userScore={finalScore} show={showLeaderboard} onBack={handleBackToCategories} />
      </div>
    )
  }

  // Render time up popup
  if (timeUp) {
    return (
      <div className="quiz-section">
        <div className="hero-bg-shape shape1"></div>
        <div className="hero-bg-shape shape2"></div>
        <div className="hero-bg-shape shape3"></div>
        <div className="hero-bg-shape shape4"></div>
        <div className="hero-bg-shape shape5"></div>
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
      <Summary
        score={score}
        finalScore={finalScore}
        timeBonus={timeBonus}
        questions={questions}
        answerStates={answerStates}
        userAnswers={userAnswers}
        handleShowLeaderboard={handleShowLeaderboard}
        handleBackToCategories={handleBackToCategories}
        onRetryThisQuiz={handleRetryThisQuiz}
      />
    )
  }

  // Render quiz page
  if (selectedCategory && currentQuestion) {
    const isMathCategory = /math|logic/i.test(selectedCategory);
    return (
      <div className="quiz-section">
        <div className="hero-bg-shape shape1"></div>
        <div className="hero-bg-shape shape2"></div>
        <div className="hero-bg-shape shape3"></div>
        <div className="hero-bg-shape shape4"></div>
        <div className="hero-bg-shape shape5"></div>
        <button className="back-btn" onClick={handleBackToCategories}>&larr; Back</button>
        <div className="quiz-timer">Time Left: <span className={timeLeft <= 10 ? 'timer-warning' : ''}>{timeLeft}s</span></div>
        {isMathCategory && (
          <button
            className="calculator-fab-btn"
            onClick={() => setShowCalc(v => !v)}
            aria-label="Open Calculator"
          >
            {showCalc ? (
              <span style={{fontSize: '1.5rem', transform: 'rotate(90deg)'}}>➔</span>
            ) : (
              <span className="calculator-svg-icon" aria-label="calculator">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="2.2rem" height="2.2rem" fill="none">
                  <rect x="5" y="3" width="22" height="26" rx="4" fill="#fff" stroke="#222" strokeWidth="2.2"/>
                  <rect x="8.5" y="6.5" width="15" height="5" rx="1.5" fill="#ffe066" stroke="#222" strokeWidth="1.5"/>
                  <rect x="8.5" y="13.5" width="4" height="4" rx="1.2" fill="#fca5a5" stroke="#222" strokeWidth="1.2"/>
                  <rect x="14" y="13.5" width="4" height="4" rx="1.2" fill="#fca5a5" stroke="#222" strokeWidth="1.2"/>
                  <rect x="19.5" y="13.5" width="4" height="4" rx="1.2" fill="#fca5a5" stroke="#222" strokeWidth="1.2"/>
                  <rect x="8.5" y="19" width="4" height="4" rx="1.2" fill="#fca5a5" stroke="#222" strokeWidth="1.2"/>
                  <rect x="14" y="19" width="4" height="4" rx="1.2" fill="#fca5a5" stroke="#222" strokeWidth="1.2"/>
                  <rect x="19.5" y="19" width="4" height="4" rx="1.2" fill="#fca5a5" stroke="#222" strokeWidth="1.2"/>
                  <rect x="14" y="24.5" width="4" height="3" rx="1.2" fill="#ffe066" stroke="#222" strokeWidth="1.2"/>
                </svg>
              </span>
            )}
            <span className="calculator-fab-tooltip">
              {showCalc ? 'Close calculator' : 'Need a calculator? Click here!'}
            </span>
          </button>
        )}
        {isMathCategory && showCalc && <Calculator />}
        <div className={`question-card question-card-fade${cardFadeOut ? ' question-card-fade-out' : ''}`}>
          {/* Progress bubbles */}
          <div className="quiz-bubbles">
            <div className="quiz-bubbles-cool-path" />
            {questions.map((_, idx) => {
              let bubbleClass = 'bubble-cool';
              if (idx === currentQuestionIdx) bubbleClass += ' current';
              else if (answerStates[idx] === 'right') bubbleClass += ' right';
              else if (answerStates[idx] === 'wrong') bubbleClass += ' wrong';
              return (
                <span key={idx} className={bubbleClass} title={`Question ${idx + 1}` + (answerStates[idx] ? (answerStates[idx] === 'right' ? ': Correct' : ': Wrong') : idx === currentQuestionIdx ? ': Current' : ': Unanswered')}>
                  {idx === currentQuestionIdx && <span className="bubble-cool-glow" />}
                  <span className="bubble-cool-inner">
                    {answerStates[idx] === 'right' ? (
                      <svg width="1.1em" height="1.1em" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.13" />
                        <path d="M6 10.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : answerStates[idx] === 'wrong' ? (
                      <svg width="1.1em" height="1.1em" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.13" />
                        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </span>
                </span>
              );
            })}
          </div>
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
          {feedbackIcon && (
            <div className={`quiz-feedback-icon ${feedbackIcon}`}>
              <span className="quiz-feedback-pulse" />
              {feedbackIcon === 'right' ? '✔️' : '❌'}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render hero/category selection
  return (
    <div className="hero-section">
      <button className="leaderboard-top-btn" onClick={handleShowLeaderboard}>Hall of Fame</button>
      <div className="hero-bg-shape shape1"></div>
      <div className="hero-bg-shape shape2"></div>
      <div className="hero-bg-shape shape3"></div>
      <div className="hero-bg-shape shape4"></div>
      <div className="hero-bg-shape shape5"></div>
      <div className="hero-glass-card">
        {/* Mascot removed */}
        {/* Animated Hero Title */}
        <motion.h1
          className="hero-title"
          style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.7, type: 'spring', stiffness: 80 } }}
        >
          QuizMaster – Built for Sharp Minds.
        </motion.h1>
        {/* Animated Subtitle */}
        <motion.div
          style={{fontWeight: 500, fontSize: '1.1rem', marginBottom: '1.5rem', color: '#222'}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.7, type: 'spring', stiffness: 60 } }}
        >
          Choose your challenge and let the quiz adventure begin! 🎯
        </motion.div>
        {/* 2x2 grid for categories, now bigger cards with icons */}
        <div className="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          justifyItems: 'center',
          margin: '0 auto',
          maxWidth: '500px',
        }}>
          {categories.map((category, idx) => {
            // Use visually distinct emoji icons for each category
            const iconMap: Record<string, string> = {
              'General Knowledge': '🧩',
              'Technology & Business': '💻',
              'History & Geopolitics': '🌎',
              'Math & Logic': '➗',
              'Science': '🔬',
              'Art & Literature': '🎨',
              'Music': '🎵',
              'Sports': '🏆',
              'Geography': '🗺️',
              'Entertainment': '🎬',
            };
            const fallbackIcons = ['🧩', '💻', '🌎', '➗', '🔬', '🎨', '🎵', '🏆', '🗺️', '🎬'];
            const icon = iconMap[category] || fallbackIcons[idx % fallbackIcons.length];
            // Highlight if category contains 'math' or 'logic' (case-insensitive)
            const isMostLoved = /math|logic/i.test(category.trim());
            if (isMostLoved) {
              return (
                <motion.div
                  key={category}
                  className={`category-card most-loved-card`}
                  onClick={() => handleCategorySelect(category)}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.12, type: 'spring', stiffness: 120, damping: 18 }}
                  whileHover={{ scale: 1.06, boxShadow: '0 8px 32px 0 #ffd70055', transition: { duration: 0.18 } }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    minHeight: '110px',
                    minWidth: '170px',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                    borderRadius: '1.2rem',
                    cursor: 'pointer',
                    background: 'linear-gradient(120deg, #ffe066 60%, #fca5a5 100%)',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                  }}
                >
                  <span className="most-loved-badge" style={{fontSize: '0.75rem', padding: '0.18em 0.7em'}}>Most Loved <span className="most-loved-crown" role="img" aria-label="crown" style={{fontSize: '1.1rem'}}>👑</span></span>
                  <span className="category-icon" style={{fontSize: '3.5rem', marginBottom: '0.7rem'}}>{icon}</span>
                  <span className="most-loved-title" style={{fontSize: '1.65rem', borderBottomWidth: '2.5px'}}> {category} </span>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={category}
                className={`category-card category-card-animate`}
                onClick={() => handleCategorySelect(category)}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.12, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.08, boxShadow: '0 8px 32px 0 #7c3aed33', background: 'rgba(255,255,255,1)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  minHeight: '110px',
                  minWidth: '170px',
                  fontSize: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                  borderRadius: '1.2rem',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  animationDelay: `${0.12 * idx}s`,
                }}
              >
                <span className="category-icon" style={{fontSize: '3.5rem', marginBottom: '0.7rem'}}>{icon}</span>
                <span>{category}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

type AnimatedNumberProps = { value: number, duration?: number };
function AnimatedNumber({ value, duration = 600 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    let startTime = Date.now();
    let raf: number | null = null;
    function animate() {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(start + (value - start) * progress));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }
    animate();
    return () => { if (raf !== null) cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span>{display}</span>;
}

export default App
