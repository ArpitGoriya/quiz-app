import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './App.css';
import './Leaderboard.css';

const mockLeaderboard = [
  { name: 'Alice', score: 22 },
  { name: 'Bob', score: 17 },
  { name: 'Charlie', score: 13 },
  { name: 'Diana', score: 10 },
  { name: 'Eve', score: 7 },
];

type LeaderboardProps = {
  userName: string;
  userScore: number;
  show: boolean;
  onBack: () => void;
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18, duration: 0.8 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.12 * i, duration: 0.7, type: 'tween', ease: [0.4, 0, 0.2, 1] } }),
};
const summaryVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16, duration: 0.7 } },
};
const buttonVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.7, type: 'spring', stiffness: 60 } },
};

const trophyIcons = ['🥇', '🥈', '🥉'];

const Leaderboard: React.FC<LeaderboardProps> = ({ userName, userScore, show, onBack }) => {
  if (!show) return null;

  // Animated score state
  const [animatedScore, setAnimatedScore] = useState(0);
  // For triggering the animation only once
  const [animationDone, setAnimationDone] = useState(false);

  // Animate the score from 0 to userScore
  useEffect(() => {
    if (!show) return;
    setAnimatedScore(0);
    setAnimationDone(false);
    let start = 0;
    const duration = 8000; // ms (even slower, more dramatic)
    const startTime = performance.now();
    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }
    function animate(now: number) {
      const elapsed = now - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);
      const progress = easeOutCubic(linearProgress);
      const value = Math.round(progress * userScore);
      setAnimatedScore(value);
      if (linearProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimationDone(true);
      }
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [userScore, show]);

  // Prepare leaderboard data with user, recalculate as animatedScore increases
  const all = [...mockLeaderboard, { name: userName, score: animatedScore }];
  all.sort((a, b) => b.score - a.score);
  const leaderboard = all.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isUser: entry.name === userName && entry.score === animatedScore,
  }));
  const userEntry = leaderboard.find(l => l.isUser);
  const userRank = userEntry?.rank;

  // Determine if the user row should be in 'animating' state
  const userRowClass = (isUser: boolean) => {
    if (!isUser) return '';
    return animationDone ? 'user-row' : 'user-row user-row-animating';
  };

  return (
    <div className="quiz-section leaderboard-section">
      <motion.div
        className="summary-card leaderboard-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* User summary card */}
        <AnimatePresence>
          {userEntry && (
            <motion.div
              className="leaderboard-user-summary"
              variants={summaryVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="leaderboard-trophy">
                {userRank && userRank <= 3 ? trophyIcons[userRank - 1] : '🏅'}
              </span>
              <span className="leaderboard-username">{userEntry.name} (You)</span>
              <span className="leaderboard-rank">Rank: <b>{userRank}</b></span>
              <span className="leaderboard-score">Score: {animatedScore}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <h2 className="summary-title leaderboard-title">🏆 Leaderboard</h2>
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                entry.isUser ? (
                  <motion.tr
                    key={entry.name + entry.score}
                    className={userRowClass(true)}
                    initial={false}
                    animate={animationDone ? { scale: 1, boxShadow: '0 4px 24px #2563eb22' } : { scale: 1.12, boxShadow: '0 0 32px 8px #facc15cc, 0 8px 32px #f472b655' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    layout
                  >
                    <td className="leaderboard-rank-cell">
                      {entry.rank <= 3 ? trophyIcons[entry.rank - 1] : entry.rank}
                    </td>
                    <td className="leaderboard-name-cell">
                      <b>{entry.name} (You)</b>
                    </td>
                    <td className={'leaderboard-score-cell user-score'}>{entry.score}</td>
                  </motion.tr>
                ) : (
                  <tr
                    key={entry.name + entry.score}
                    className={userRowClass(false)}
                  >
                    <td className="leaderboard-rank-cell">
                      {entry.rank <= 3 ? trophyIcons[entry.rank - 1] : entry.rank}
                    </td>
                    <td className="leaderboard-name-cell">
                      {entry.name}
                    </td>
                    <td className={'leaderboard-score-cell'}>{entry.score}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        
        <motion.button
          className="next-btn leaderboard-back-btn"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1, duration: 0.7, type: 'spring', stiffness: 60 } }}
          onClick={onBack}
        >
          Start the Quiz
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Leaderboard; 