import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_WRONG_GUESSES = 11;

function Game({ username }) {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [correctGuesses, setCorrectGuesses] = useState([]);
  const [status, setStatus] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // This will talk with the backend and fetch a random word from the db
    const fetchWord = async () => {
      try {
        const response = await fetch('http://localhost:4000/randomWord');
        if (!response.ok) {
          throw new Error('Failed to fetch word');
        }
        const data = await response.json();
        setWord(data.word.toLowerCase());
      } catch (error) {
        console.error('Failed to fetch word:', error);
      }
    };
    fetchWord();
  }, []);

  useEffect(() => {
    console.log('Word:', word);
    console.log('Correct Guesses:', correctGuesses);
    console.log('Wrong Guesses:', wrongGuesses);
  }, [word, correctGuesses, wrongGuesses]);

  // This saves the score
  const saveScore = useCallback(async (username, totalGuesses, wordLength) => {
    try {
      console.log('Saving score:', totalGuesses);
      const response = await fetch('http://localhost:4000/session/saveScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, score: totalGuesses, wordLength }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      console.log('Score saved:', result);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }, []);

  // This handles the win
  const handleWin = useCallback(() => {
    const totalGuesses = guesses.length;
    setStatus(`Congratulations! You guessed the word "${word}" in ${totalGuesses} tries!`);

    // Save the score with the correct word length
    saveScore(username, totalGuesses, word.length);

    // Navigate to the high scores page after a delay
    setTimeout(() => {
      navigate(`/highscores/${word.length}`);
    }, 2000); // Use 2 seconds delay
  }, [guesses, navigate, saveScore, username, word]);

  // This handles the loss
  const handleLoss = useCallback(() => {
    setStatus(`You failed! The correct word was "${word}".`);
    setGameOver(true);

    // Save the score with the maximum wrong guesses
    //saveScore(username, MAX_WRONG_GUESSES, word.length);

    // Navigate to the high scores page after a delay
    setTimeout(() => {
      navigate(`/highscores/${word.length}`);
    }, 4000); // Use 4 seconds delay
   }, //[navigate, saveScore, username, word]);
  [navigate, , username, word]);

  useEffect(() => {
    if (word && correctGuesses.length === new Set(word.split('')).size) {
      handleWin();
    } else if (wrongGuesses.length >= MAX_WRONG_GUESSES) {
      handleLoss();
    }
  }, [correctGuesses, handleWin, handleLoss, word, wrongGuesses.length]);

  // This takes a letter and handles the guess
  const handleGuess = (letter) => {
    if (gameOver) return;

    letter = letter.toLowerCase();

    if (guesses.includes(letter)) {
      alert('You already guessed that letter!');
      return;
    }

    setGuesses([...guesses, letter]);
    if (word.includes(letter)) {
      setCorrectGuesses([...correctGuesses, letter]);
    } else {
      setWrongGuesses([...wrongGuesses, letter]);
    }
  };

  const letterRows = [
    'abcdef'.split(''),
    'ghijkl'.split(''),
    'mnopqr'.split(''),
    'stuvwx'.split(''),
    'yz'.split(''),
  ];

  return (
    <div className="game">
      <h1>Hangman Game</h1>
      <p>Welcome, {username}!</p>
      <div className="word">
        {word.split('').map((letter, index) =>
          correctGuesses.includes(letter) ? (
            <span key={index} className="letter">{letter}</span>
          ) : (
            <span key={index} className="letter">_</span>
          )
        )}
      </div>
      <div className="letters">
        {letterRows.map((row, rowIndex) => (
          <div key={rowIndex} className="letter-row">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guesses.includes(letter) || gameOver}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="wrong-guesses">
        <p>Wrong guesses: {wrongGuesses.join(', ')}</p>
      </div>
      <div className="guess-counter">
        <p>{wrongGuesses.length} / {MAX_WRONG_GUESSES} wrong guesses</p>
      </div>
      {status && (
        <div className="status-message">
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}

export default Game;