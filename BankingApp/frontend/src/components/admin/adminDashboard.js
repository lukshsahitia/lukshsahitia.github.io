import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PromotionDemotion from '../shared/promotionDemotion';
import CreateCustomer from '../shared/createCustomer';
import AccountDetails from '../shared/accountDetails';
import TransactionHistory from '../shared/transactionHistory';
import WithdrawDeposit from '../shared/moneyTransfer';
import SearchCustomer from '../shared/searchCustomer';
import TransferBetweenCustomers from '../shared/transferBetweenCustomers';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && (storedUser.role === 'admin' || storedUser.role === 'administrator')) {
            setUser(storedUser);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#eef2f7' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                {user && (
                    <div className="welcome-message">
                        <h2>Welcome, <span className="user-name">{user.firstName} {user.lastName}</span>!</h2>
                    </div>
                )}
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <AccountDetails />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <TransactionHistory role="admin" />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <WithdrawDeposit />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <CreateCustomer />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <TransferBetweenCustomers />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <SearchCustomer />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 mb-4">
                    <div className="card custom-card shadow-sm h-100">
                        <div className="card-body">
                            <PromotionDemotion />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}