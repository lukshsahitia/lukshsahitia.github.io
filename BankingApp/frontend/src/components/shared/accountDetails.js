import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Account Details component to display customer's account information and balances.
const AccountDetails = ({ details }) => {
    const [accountDetails, setAccountDetails] = useState(details || null);

    useEffect(() => {
        if (!details) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                axios.get(`http://localhost:4000/findCustomer`, {
                    params: {
                        customerID: user.customerID // Fetching customerID from the logged-in user's details
                    }
                })
                .then(response => {
                    setAccountDetails(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the account details!', error);
                });
            }
        }
    }, [details]);

    if (!accountDetails) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="container my-4">
            <div className="card shadow">
                <div className="card-body">
                    <h2 className="text-center mb-4">Account Details</h2>
                    <div className="mb-3">
                        <p className="text-muted mb-1"><strong>Account Holder:</strong> {accountDetails.firstName} {accountDetails.lastName}</p>
                        <p className="text-muted mb-1"><strong>Account ID:</strong> {accountDetails.customerID}</p>

                        <div className="border rounded p-3 mb-3">
                            <h5 className="mb-2">Checking Account</h5>
                            <p className="mb-1"><strong>Balance:</strong> ${accountDetails.checking.toFixed(2)}</p>
                        </div>

                        <div className="border rounded p-3 mb-3">
                            <h5 className="mb-2">Savings Account</h5>
                            <p className="mb-1"><strong>Balance:</strong> ${accountDetails.savings.toFixed(2)}</p>
                        </div>

                        <div className="border rounded p-3 mb-3">
                            <h5 className="mb-2">Investment Account</h5>
                            <p className="mb-1"><strong>Balance:</strong> ${accountDetails.investment.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDetails;