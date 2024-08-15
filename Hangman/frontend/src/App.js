import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import EnterName from './components/EnterName';
import Game from './components/Game';
import HighScores from './components/HighScores';

const App = () => {
  const [username, setUsername] = useState('');

  return (
    <div>
      <Routes>
        <Route path="/" element={<EnterName setUsername={setUsername} />} />
        <Route path="/game" element={<Game username={username} />} />
        <Route path="/highscores/:wordLength" element={<HighScores />} />
      </Routes>
    </div>
  );
};

export default App;