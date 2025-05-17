import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import Confetti from 'react-confetti';
import './Summary.css';

// Types
interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  [key: string]: any;
}

interface SummaryProps {
  score: number;
  finalScore: number;
  timeBonus: number;
  questions: Question[];
  answerStates: (null | 'right' | 'wrong')[];
  userAnswers: string[];
  handleShowLeaderboard: () => void;
  handleBackToCategories: () => void;
  onRetryThisQuiz?: () => void;
  onTryAnotherQuiz?: () => void;
}

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.85, rotate: -8, y: 60 },
  visible: { opacity: 1, scale: 1, rotate: 0, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18, duration: 0.8 } },
};
const statsContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
};
const statItem = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'tween', duration: 1.1, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: 32, scale: 0.95, transition: { duration: 0.5 } },
};
const reviewList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
};
const reviewItem = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};
const buttonVariants = {
  rest: { scale: 1, boxShadow: '0 2px 8px rgba(30,41,59,0.08)' },
  hover: { scale: 1.08, boxShadow: '0 8px 32px 0 #7c3aed33', transition: { type: 'spring', stiffness: 300 } },
  tap: { scale: 0.96 },
};
const buttonFade = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 } },
  exit: { opacity: 0, y: 32, transition: { duration: 0.5 } },
};
const reviewSectionFade = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { type: 'tween', duration: 1.1, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: 32, transition: { duration: 0.5 } },
};

const Summary: React.FC<SummaryProps> = ({
  score,
  finalScore,
  timeBonus,
  questions,
  answerStates,
  userAnswers,
  handleShowLeaderboard,
  handleBackToCategories,
  onRetryThisQuiz,
  onTryAnotherQuiz,
}) => {
  // Find all wrong questions
  const wrongQuestions = questions
    .map((q, idx) => ({
      ...q,
      idx,
      userAnswer: answerStates[idx],
      selected: userAnswers[idx],
    }))
    .filter((q, idx) => answerStates[idx] === 'wrong');
  const noMistakes = wrongQuestions.length === 0;

  // Get window size for confetti
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine celebration emoji based on score percentage
  let celebrationEmoji = '';
  const percent = questions.length > 0 ? finalScore / questions.length : 0;
  if (finalScore === questions.length && questions.length > 0) {
    celebrationEmoji = '🏆';
  } else if (percent >= 0.7) {
    celebrationEmoji = '⭐';
  } else if (finalScore >= 1) {
    celebrationEmoji = '👏';
  } else {
    celebrationEmoji = '🤔';
  }

  // Sequential reveal for stats
  const [revealedStats, setRevealedStats] = React.useState(0);
  React.useEffect(() => {
    setRevealedStats(0);
    const timers: number[] = [];
    for (let i = 1; i <= 4; i++) {
      timers.push(setTimeout(() => setRevealedStats(i), i * 900));
    }
    return () => timers.forEach(clearTimeout);
  }, [score, finalScore, timeBonus, questions.length]);

  // Remove scroll to review section
  // Instead, show animated down arrow if there are mistakes and stats are fully revealed
  const [showArrow, setShowArrow] = React.useState(false);
  React.useEffect(() => {
    if (!noMistakes && revealedStats === 4) {
      const timer = setTimeout(() => setShowArrow(true), 900); // Show arrow after message
      return () => clearTimeout(timer);
    } else {
      setShowArrow(false);
    }
  }, [noMistakes, revealedStats]);

  // State for try again options
  const [showTryOptions, setShowTryOptions] = React.useState(false);

  const reviewRef = React.useRef<HTMLDivElement | null>(null);
  const mainCardRef = React.useRef<HTMLDivElement | null>(null);

  // Hide the down arrow when user scrolls down
  React.useEffect(() => {
    const card = mainCardRef.current;
    if (!card) return;
    const handleScroll = () => {
      if (card.scrollTop > 40) {
        setShowArrow(false);
      } else if (!noMistakes && revealedStats === 4) {
        setShowArrow(true);
      }
    };
    card.addEventListener('scroll', handleScroll);
    return () => card.removeEventListener('scroll', handleScroll);
  }, [noMistakes, revealedStats]);

  return (
    <div className="summary-root">
      {/* Animated background shapes */}
      <div className="hero-bg-shape shape1"></div>
      <div className="hero-bg-shape shape2"></div>
      <div className="hero-bg-shape shape3"></div>
      <div className="hero-bg-shape shape4"></div>
      <div className="hero-bg-shape shape5"></div>
      {/* Confetti celebration always shown */}
      <Confetti
        width={dimensions.width}
        height={dimensions.height}
        numberOfPieces={350}
        recycle={false}
        gravity={0.25}
        initialVelocityY={18}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000, pointerEvents: 'none' }}
      />
      <motion.div
        className="summary-main-card"
        ref={mainCardRef}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Animated emoji based on performance */}
        <motion.div
          className="summary-emoji-celebration"
          initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
          animate={{
            opacity: 1,
            scale: [1.18, 1.3, 1.1, 1.22, 1],
            rotate: [0, 10, -8, 0, 0],
            transition: { duration: 1.2, times: [0,0.2,0.5,0.8,1], repeat: Infinity, repeatType: 'loop' }
          }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.2rem', zIndex: 10 }}
        >
          <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 24px #facc15aa)' }} role="img" aria-label="Celebration Emoji">{celebrationEmoji}</span>
        </motion.div>
        <motion.div className="summary-header" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.6 } }}>
          <h2 className="summary-title-new">Quiz Results</h2>
        </motion.div>
        <motion.div className="summary-stats-new" variants={statsContainer} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem' }}>
          {/* Always render all stat slots for smooth layout */}
          <div style={{ minHeight: 56, width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {revealedStats >= 1 && (
                <motion.div className="summary-stat-item" variants={statItem} initial="hidden" animate="visible" exit="exit" key="stat1">
                  <span className="summary-stat-label">Score</span>
                  <span className="summary-stat-value">{score} / {questions.length}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ minHeight: 56, width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {revealedStats >= 2 && (
                <motion.div className="summary-stat-item" variants={statItem} initial="hidden" animate="visible" exit="exit" key="stat2">
                  <span className="summary-stat-label">Time Bonus</span>
                  <span className="summary-stat-value">+{timeBonus}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ minHeight: 56, width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {revealedStats >= 3 && (
                <motion.div className="summary-stat-item" variants={statItem} initial="hidden" animate="visible" exit="exit" key="stat3">
                  <span className="summary-stat-label">Final Score</span>
                  <span className="summary-stat-value highlight">{finalScore}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ minHeight: 56, width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              {revealedStats >= 4 && (
                <motion.div className="summary-message-new" variants={statItem} initial="hidden" animate="visible" exit="exit" key="stat4">
                  {finalScore === questions.length && '🎉 Perfect!'}
                  {finalScore >= Math.ceil(questions.length * 0.7) && finalScore < questions.length && 'Great job!'}
                  {finalScore < Math.ceil(questions.length * 0.7) && 'Keep practicing!'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        {/* Animate buttons in after stats reveal, always reserve space */}
        <div style={{ minHeight: 64, width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            {revealedStats >= 4 && (
              <motion.div
                className="summary-actions"
                variants={buttonFade}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: '100%', display: 'flex', gap: '1.2rem', justifyContent: 'center' }}
              >
                <motion.button
                  className="summary-btn"
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleShowLeaderboard}
                >
                  View Leaderboard
                </motion.button>
                <motion.button
                  className="summary-btn secondary"
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowTryOptions(v => !v)}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Try Again Modal */}
        <AnimatePresence>
          {revealedStats >= 4 && showTryOptions && (
            <>
              {/* Overlay */}
              <motion.div
                className="summary-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2000 }}
                onClick={() => setShowTryOptions(false)}
                aria-label="Close Try Again Modal"
              />
              {/* Modal */}
              <motion.div
                className="summary-modal"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 18 } }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2100,
                  background: 'rgba(255,255,255,0.98)',
                  borderRadius: '1.5rem',
                  boxShadow: '0 8px 40px rgba(80, 80, 180, 0.18)',
                  padding: '2.2rem 2.5rem 2.2rem 2.5rem',
                  minWidth: 320,
                  maxWidth: '90vw',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
              >
                {/* Close button */}
                <button
                  onClick={() => setShowTryOptions(false)}
                  style={{
                    position: 'absolute',
                    top: '1.1rem',
                    right: '1.3rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    color: '#888',
                    cursor: 'pointer',
                    zIndex: 2200,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#312e81', marginBottom: '0.7rem', textAlign: 'center' }}>
                  Would you like to retry this quiz or try a different one?
                </div>
                <div style={{ display: 'flex', gap: '1.2rem', width: '100%', justifyContent: 'center' }}>
                  <motion.button
                    className="summary-btn"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    style={{ fontSize: '1.1rem', minWidth: 140 }}
                    onClick={() => { setShowTryOptions(false); onRetryThisQuiz && onRetryThisQuiz(); }}
                  >
                    Retry This Quiz
                  </motion.button>
                  <motion.button
                    className="summary-btn secondary"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    style={{ fontSize: '1.1rem', minWidth: 140 }}
                    onClick={() => { setShowTryOptions(false); (onTryAnotherQuiz || handleBackToCategories)(); }}
                  >
                    Try Another Quiz
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        {/* Animated down arrow to prompt scroll for review (now below buttons) */}
        {showArrow && (
          <motion.div
            className="summary-scroll-arrow"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, 12, 0], transition: { duration: 1.2, repeat: Infinity, repeatType: 'loop' } }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.2rem 0 0.2rem 0' }}
          >
            <span style={{ fontSize: '2.2rem', color: '#7c3aed', filter: 'drop-shadow(0 2px 8px #7c3aed33)' }} role="img" aria-label="Scroll Down">⬇️</span>
          </motion.div>
        )}
        {/* Review section only after stats and buttons are revealed */}
        <AnimatePresence>
        {revealedStats >= 4 && !noMistakes && (
          <motion.div
            className="summary-review-section"
            variants={reviewSectionFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            ref={reviewRef}
          >
            <motion.h3 className="summary-review-title-new" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.5 } }}>
              Review Your Mistakes
            </motion.h3>
            <div className="summary-review-list">
              {wrongQuestions.map(q => (
                <motion.div
                  key={q.idx}
                  className="summary-review-item-new"
                  variants={reviewItem}
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 32px #f43f5e22', background: '#fffbe6' }}
                >
                  <div className="summary-review-q-new">Q{q.idx + 1}: {q.question}</div>
                  <div className="summary-review-a-new">
                    <span className="wrong-label-new">Your answer:</span> <span className="wrong-answer-new">{q.selected}</span>
                  </div>
                  <div className="summary-review-a-new">
                    <span className="right-label-new">Correct answer:</span> <span className="right-answer-new">{q.options[q.correctIndex]}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Summary; 