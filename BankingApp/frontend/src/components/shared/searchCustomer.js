import React, { useState } from 'react';
import AccountDetails from './accountDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

// This function gives admin and employee users the ability to search for a customer by their customer ID
export default function SearchCustomer() {
    const [searchInput, setSearchInput] = useState('');
    const [customerDetails, setCustomerDetails] = useState(null);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => setSearchInput(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!searchInput) {
            setMessage('Please enter a Customer ID');
            return;
        }

        // Clear the previous customer details before making a new request
        setCustomerDetails(null);
        setMessage('');  // Clear previous messages

        try {
            const response = await fetch(`http://localhost:4000/findCustomer?customerID=${searchInput}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCustomerDetails(data);
            } else {
                const result = await response.json();
                setMessage(result.error || 'Customer not found');
            }
        } catch (error) {
            setMessage('Error searching for customer');
        }
    };

    return (
        <div className="container my-4">
            <div className={`card p-4 shadow-sm ${customerDetails ? 'expanded-card' : ''}`}>
                <h2 className="text-center mb-4">Search Customer</h2>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="mb-3">
                        <label htmlFor="searchInput" className="form-label">Customer ID:</label>
                        <input
                            type="text"
                            id="searchInput"
                            value={searchInput}
                            onChange={handleInputChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100">Search</button>
                </form>
                {message && <p className="text-danger mt-3">{message}</p>}
                {customerDetails && (
                    <div className="mt-4">
                        <AccountDetails details={customerDetails} />
                    </div>
                )}
            </div>
        </div>
    );
}