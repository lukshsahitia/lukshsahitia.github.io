import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EnterName({ setUsername }) {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() !== '') {
            setUsername(name);
            navigate('/game');
        }
    };

    return (
        <div className="enterName">
            <h1>Enter Your Name</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                />
                <button type="submit">Start Game</button>
            </form>
        </div>
    );
}

export default EnterName;
