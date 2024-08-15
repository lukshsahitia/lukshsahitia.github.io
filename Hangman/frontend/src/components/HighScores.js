import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// This component fetches and displays the high scores for a given word length
function HighScores() {
  const { wordLength } = useParams(); 
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScores();
  }, [wordLength]);

  // This fetches the high scores for the given word length
  const fetchScores = async () => {
    try {
      const response = await fetch(`http://localhost:4000/session/highScores/${wordLength}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scores');
      }
      const data = await response.json();
      console.log('Fetched scores:', data);
      setScores(data);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    }
  };

  // Handler for restarting the game
  const handleRestart = () => {
    navigate('/');
  };

  return (
    <div className="high-scores">
      <h1>High Scores for {wordLength}-Letter Words</h1>
      <ul>
        {scores.map((score, index) => (
          <li key={index}>
            {index + 1}. {score.player} - {score.score} guesses
          </li>
        ))}
      </ul>
      <button onClick={handleRestart}>Restart Game</button>
    </div>
  );
}

export default HighScores;