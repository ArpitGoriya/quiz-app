import React from 'react';
import './App.css';

const mockLeaderboard = [
  { name: 'Alice', score: 18 },
  { name: 'Bob', score: 15 },
  { name: 'Charlie', score: 12 },
  { name: 'Diana', score: 10 },
  { name: 'Eve', score: 8 },
];

type LeaderboardProps = {
  userName: string;
  userScore: number;
  show: boolean;
  onBack: () => void;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ userName, userScore, show, onBack }) => {
  if (!show) return null;

  // Prepare leaderboard data with user
  const all = [...mockLeaderboard, { name: userName, score: userScore }];
  all.sort((a, b) => b.score - a.score);
  const leaderboard = all.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isUser: entry.name === userName && entry.score === userScore,
  }));
  const userRank = leaderboard.find(l => l.isUser)?.rank;

  return (
    <div className="quiz-section">
      <div className="summary-card leaderboard-card">
        <h2 className="summary-title">🏆 Leaderboard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.name + entry.score} className={entry.isUser ? 'user-row' : ''}>
                <td>{entry.rank}</td>
                <td>{entry.isUser ? <b>{entry.name} (You)</b> : entry.name}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-message">Your Rank: <b>{userRank}</b></div>
        <button className="next-btn" onClick={onBack}>Back to Categories</button>
      </div>
    </div>
  );
};

export default Leaderboard; 