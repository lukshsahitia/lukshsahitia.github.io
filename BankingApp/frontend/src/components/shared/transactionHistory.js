import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

// This function will show the logged-in user’s transactions and allows employees or admins to search for other accounts’ transaction histories
export default function TransactionHistory({ customerAccountId }) {
    const [accountId, setAccountId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [accountType, setAccountType] = useState('all'); // Default to 'all' for full history
    const [message, setMessage] = useState('');
    const [view, setView] = useState('my'); // Set view based on role
    const [currentCustomerId, setCurrentCustomerId] = useState(''); // Track the current customer being viewed
    const [searchedCustomerName, setSearchedCustomerName] = useState(''); // Track the name of the searched customer
    const [storedUser, setStoredUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setStoredUser(user);
            setCurrentCustomerId(user.customerID); // Set the default customerID to the logged-in user
            setView('my'); // Explicitly set to 'my'
            fetchTransactions(user.customerID);
        }
    }, []);

    const handleInputChange = (e) => setAccountId(e.target.value);

    const handleAccountTypeChange = (type) => {
        setAccountType(type);

        if (view === 'my') {
            if (storedUser) {
                setCurrentCustomerId(storedUser.customerID);
                if (type === 'all') {
                    fetchTransactions(storedUser.customerID);
                } else {
                    fetchAccountTransactions(storedUser.customerID, type);
                }
            }
        } else if (view === 'customer' && currentCustomerId) {
            if (type === 'all') {
                fetchTransactions(currentCustomerId);
            } else {
                fetchAccountTransactions(currentCustomerId, type);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accountId) {
            setMessage('Please enter a customer ID');
            return;
        }
        
        setCurrentCustomerId(accountId); // Set the current customer ID to the searched ID
        try {
            const response = await axios.get(`http://localhost:4000/findCustomer`, {
                params: { customerID: accountId }
            });

            if (response.data) {
                const { firstName, lastName } = response.data;
                setSearchedCustomerName(`${firstName} ${lastName}`);
            }

            if (accountType === 'all') {
                fetchTransactions(accountId);
            } else {
                fetchAccountTransactions(accountId, accountType);
            }
        } catch (error) {
            setMessage('Customer not found');
        }
    };

    const handleMyTransactions = () => {
        if (storedUser) {
            setCurrentCustomerId(storedUser.customerID); // Reset to the logged-in user's customerID
            setView('my');
            setAccountType('all'); // Reset account type to 'all'
            setSearchedCustomerName(''); // Clear searched name
            fetchTransactions(storedUser.customerID);
        }
    };

    const handleCustomerTransactions = () => {
        setView('customer');
        if (accountId) {
            setCurrentCustomerId(accountId); // Set the current customer ID to the searched ID
            if (accountType === 'all') {
                fetchTransactions(accountId);
            } else {
                fetchAccountTransactions(accountId, accountType);
            }
        }
    };

    const fetchTransactions = async (customerID) => {
        try {
            const response = await axios.get(`http://localhost:4000/customerTransactions`, {
                params: { customerID }
            });
            if (response.status === 200 && response.data.length > 0) {
                setTransactions(response.data);
                setMessage('');
            } else {
                setTransactions([]);
                setMessage('No transactions found for this customer');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
            setMessage('Error fetching transactions');
        }
    };

    const fetchAccountTransactions = async (customerID, account) => {
        try {
            const response = await axios.get(`http://localhost:4000/customerAccountTransactions`, {
                params: { customerID, account }
            });
            if (response.status === 200 && response.data.length > 0) {
                setTransactions(response.data);
                setMessage('');
            } else {
                setTransactions([]);
                setMessage('No transactions found for this account');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
            setMessage('Error fetching transactions');
        }
    };

    return (
        <div className="container my-4">
            <div className="card p-4 shadow-sm">
                <h2 className="text-center mb-4">Transaction History</h2>

                {storedUser && storedUser.role !== 'customer' && (
                    <>
                        <div className="mb-3 d-flex justify-content-center">
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="historyType"
                                    id="myHistory"
                                    value="my"
                                    checked={view === 'my'}
                                    onChange={handleMyTransactions}
                                />
                                <label className="form-check-label" htmlFor="myHistory">
                                    My Transaction History
                                </label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="historyType"
                                    id="customerHistory"
                                    value="customer"
                                    checked={view === 'customer'}
                                    onChange={handleCustomerTransactions}
                                />
                                <label className="form-check-label" htmlFor="customerHistory">
                                    Customer Transaction History
                                </label>
                            </div>
                        </div>

                        {view === 'customer' && (
                            <form onSubmit={handleSubmit} className="mb-4">
                                <div className="d-flex justify-content-between mb-3">
                                    <input
                                        type="text"
                                        id="accountId"
                                        value={accountId}
                                        onChange={handleInputChange}
                                        className="form-control me-2"
                                        placeholder="Enter Customer ID"
                                    />
                                    <button type="submit" className="btn btn-success">Search</button>
                                </div>
                            </form>
                        )}

                        {view === 'customer' && searchedCustomerName && (
                            <h3 className="transactions-for-label mb-3">Transactions for: {searchedCustomerName}</h3>
                        )}
                    </>
                )}

                <div className="d-flex justify-content-center mb-3">
                    <button
                        className={`btn ${accountType === 'all' ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                        onClick={() => handleAccountTypeChange('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${accountType === 'checking' ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                        onClick={() => handleAccountTypeChange('checking')}
                    >
                        Checking
                    </button>
                    <button
                        className={`btn ${accountType === 'savings' ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                        onClick={() => handleAccountTypeChange('savings')}
                    >
                        Savings
                    </button>
                    <button
                        className={`btn ${accountType === 'investment' ? 'btn-primary' : 'btn-outline-primary'} mx-1`}
                        onClick={() => handleAccountTypeChange('investment')}
                    >
                        Investment
                    </button>
                </div>

                {message && <p className="text-danger">{message}</p>}

                {transactions.length > 0 && (
                    <div>
                        <h3 className="mb-3">Transactions</h3>
                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Account Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(transaction => (
                                        <tr key={transaction._id}>
                                            <td>{new Date(transaction.dateTime).toLocaleDateString()}</td>
                                            <td>{transaction.transaction_type}</td>
                                            <td>${transaction.amount.toFixed(2)}</td>
                                            <td>{transaction.account}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}