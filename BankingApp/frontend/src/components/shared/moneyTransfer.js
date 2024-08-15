import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MoneyTransfer() {

    const [transferAmount, setTransferAmount] = useState('');
    const [transferType, setTransferType] = useState('local'); // Transfer type: local or external
    const [fromAccount, setFromAccount] = useState('savings');
    const [toAccount, setToAccount] = useState('checking');
    const [externalAccountNumber, setExternalAccountNumber] = useState(''); // For external transfers
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const transferAmountFloat = parseFloat(transferAmount);

        if (transferAmountFloat <= 0) {
            setError('Transfer amount must be positive.');
            return;
        }

        if (transferType === 'local' && fromAccount === toAccount) {
            setError('Source and destination accounts cannot be the same.');
            return;
        }

        if (transferType === 'external' && externalAccountNumber.trim() === '') {
            setError('Please provide an external account number.');
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));

        const transactionData = {
            fromCustomerID: user.customerID,
            fromAccount: fromAccount,
            toCustomerID: transferType === 'external' ? externalAccountNumber : user.customerID,
            toAccount: toAccount,
            amount: transferAmountFloat,
            isLocal: transferType === 'local'
        };

        try {
            const response = await fetch('http://localhost:4000/Transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Failed to perform transfer');
            }

            setTransferAmount('');
            setExternalAccountNumber('');
            setError('');
            alert('Transfer successful!');

            window.location.reload(); // <--- quick fix
        } catch (error) {
            console.error('Error performing transfer:', error);
            setError(error.message || 'Failed to perform transfer');
        }
    };

    return (
        <div className="container my-4">
            <div className="card p-4 shadow-sm">
                <h3 className="text-center mb-4">Money Transfer</h3>
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-12 col-md-6 mb-3 mb-md-0">
                            <label htmlFor="fromAccount" className="form-label">From:</label>
                            <select
                                id="fromAccount"
                                className="form-select"
                                value={fromAccount}
                                onChange={(e) => setFromAccount(e.target.value)}
                            >
                                <option value="savings">Savings</option>
                                <option value="checking">Checking</option>
                                <option value="investment">Investment</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-6">
                            <label htmlFor="toAccount" className="form-label">To:</label>
                            <select
                                id="toAccount"
                                className="form-select"
                                value={toAccount}
                                onChange={(e) => setToAccount(e.target.value)}
                            >
                                <option value="savings">Savings</option>
                                <option value="checking">Checking</option>
                                <option value="investment">Investment</option>
                            </select>
                        </div>
                    </div>

                    {transferType === 'external' && (
                        <div className="mb-3">
                            <label htmlFor="externalAccountNumber" className="form-label">External Account Number:</label>
                            <input
                                type="text"
                                id="externalAccountNumber"
                                className="form-control"
                                value={externalAccountNumber}
                                onChange={(e) => setExternalAccountNumber(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="amount" className="form-label">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            className="form-control"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="transferType"
                                value="local"
                                checked={transferType === 'local'}
                                onChange={() => setTransferType('local')}
                            />
                            <label className="form-check-label" htmlFor="local">
                                Transfer within My Accounts
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="transferType"
                                value="external"
                                checked={transferType === 'external'}
                                onChange={() => setTransferType('external')}
                            />
                            <label className="form-check-label" htmlFor="external">
                                Transfer to Another External Account
                            </label>
                        </div>
                    </div>

                    {error && <p className="text-danger">{error}</p>}
                    <button type="submit" className="btn btn-success w-100">Transfer</button>
                </form>
            </div>
        </div>
    );
}