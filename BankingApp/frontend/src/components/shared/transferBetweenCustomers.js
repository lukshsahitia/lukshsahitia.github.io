import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// This function gives admin and employee users the ability to transfer money between customers

export default function TransferBetweenCustomers() {
    const [fromCustomerId, setFromCustomerId] = useState('');
    const [toCustomerId, setToCustomerId] = useState('');
    const [fromAccountType, setFromAccountType] = useState('checking');
    const [toAccountType, setToAccountType] = useState('checking');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleTransfer = async () => {
        if (fromCustomerId && toCustomerId && amount) {
            try {
                const response = await fetch('http://localhost:4000/Transaction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fromCustomerID: fromCustomerId,
                        fromAccount: fromAccountType,
                        toCustomerID: toCustomerId,
                        toAccount: toAccountType,
                        amount: parseFloat(amount),
                        isLocal: fromCustomerId === toCustomerId
                    })
                });

                if (response.ok) {
                    setMessage(`Transferred $${amount} from Customer ${fromCustomerId} (${fromAccountType}) to Customer ${toCustomerId} (${toAccountType})`);
                    
                    // Reset form fields after successful transfer
                    setFromCustomerId('');
                    setToCustomerId('');
                    setAmount('');
                    setFromAccountType('checking');
                    setToAccountType('checking');
                    
                    window.location.reload(); // <--- quick fix
                } else {
                    const result = await response.json();
                    setMessage(result.error);
                }
            } catch (err) {
                setMessage('Failed to transfer money.');
            }
        } else {
            setMessage('Please fill in all fields.');
        }
    };

    return (
        <div className="container my-4">
            <div className="card p-4 shadow-sm">
                <h2 className="text-center mb-4">Transfer Money Between Customers</h2>

                {/* From Customer */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="From Customer ID"
                        value={fromCustomerId}
                        onChange={(e) => setFromCustomerId(e.target.value)}
                        className="form-control mb-2"
                    />
                    <select
                        value={fromAccountType}
                        onChange={(e) => setFromAccountType(e.target.value)}
                        className="form-select"
                    >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="investment">Investment</option>
                    </select>
                </div>

                {/* To Customer */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="To Customer ID"
                        value={toCustomerId}
                        onChange={(e) => setToCustomerId(e.target.value)}
                        className="form-control mb-2"
                    />
                    <select
                        value={toAccountType}
                        onChange={(e) => setToAccountType(e.target.value)}
                        className="form-select"
                    >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="investment">Investment</option>
                    </select>
                </div>

                {/* Amount */}
                <div className="mb-3">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="form-control"
                    />
                </div>

                {/* Transfer Button */}
                <button onClick={handleTransfer} className="btn btn-success w-100 mb-3">Transfer</button>

                {/* Message Display */}
                {message && <p className="text-success">{message}</p>}
            </div>
        </div>
    );
}