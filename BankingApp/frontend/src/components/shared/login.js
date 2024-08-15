import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

//LOGINS
// CustomerID: 69580
// Password: blake 

// CustomerID: 19638
// Password: anakin 

// CustomerID: 13579
// Password: abcde  

// CustomerID: 12345
// Password: password123 

// This function is used to log in to the application
export default function Login() {
    const [customerID, setCustomerID] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/session/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customerID, password }),
                credentials: 'include'
            });
    
            const result = await response.json();
    
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(result.user));
                if (result.user.role === 'admin'|| result.user.role === 'administrator') {
                    navigate('/adminDashboard');
                } else if (result.user.role === 'employee') {
                    navigate('/employeeDashboard');
                } else {
                    navigate('/customerDashboard');
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('The user ID or password were incorrect. Try again!');
        }
    };    

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4 rounded" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="text-center text-primary mb-4">Welcome Back!</h1>
                <p className="text-center text-muted mb-4">Please log in to your account.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="customerID" className="form-label">Customer ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="customerID"
                            placeholder="Enter your Customer ID"
                            value={customerID}
                            onChange={(e) => setCustomerID(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
}