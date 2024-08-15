import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// This function gives admin users the ability to promote or demote a user's role

export default function PromotionDemotion() {
    const [userId, setUserId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [confirmation, setConfirmation] = useState(false);
    const [confirmedName, setConfirmedName] = useState('');
    const [confirmedRole, setConfirmedRole] = useState('');
    const [message, setMessage] = useState('');

    const handleUserIdChange = async (e) => {
        const id = e.target.value;
        setUserId(id);
        
        try {
            const response = await fetch(`http://localhost:4000/findCustomer?customerID=${id}`);
            if (response.ok) {
                const data = await response.json();
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setSelectedRole(data.role); // This assumes 'role' is either 'customer', 'employee', or 'admin'
                setMessage('');
            } else {
                setFirstName('');
                setLastName('');
                setSelectedRole('');
                setMessage('User not found');
            }
        } catch (error) {
            setMessage('Error searching for user');
        }
    };

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async () => {
        if (userId && selectedRole) {
            try {
                const response = await fetch('http://localhost:4000/changeCustomerRole', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customerID: userId,
                        newRole: selectedRole,
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    setConfirmedName(`${firstName} ${lastName}`);
                    setConfirmedRole(selectedRole);
                    setConfirmation(true);
                    setTimeout(() => {
                        setConfirmation(false);
                    }, 3000);

                    // Clear input fields after submission
                    setUserId('');
                    setFirstName('');
                    setLastName('');
                    setSelectedRole('');
                } else {
                    setMessage(result.error || 'Failed to change role.');
                }
            } catch (error) {
                setMessage('Failed to change role.');
            }
        } else {
            alert('Please enter a valid User ID and select a role.');
        }
    };

    return (
        <div className="container my-4">
            <div className="card p-4 shadow-sm">
                <h1 className="text-center mb-4">Role Management</h1>
                <form>
                    <div className="mb-3">
                        <label htmlFor="userId" className="form-label">User ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="userId"
                            placeholder="Enter User ID"
                            value={userId}
                            onChange={handleUserIdChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            placeholder="First Name"
                            value={firstName}
                            disabled
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            placeholder="Last Name"
                            value={lastName}
                            disabled
                        />
                    </div>
                    <div className="d-flex justify-content-between mb-4">
                        <button
                            type="button"
                            className={`btn ${selectedRole === 'customer' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1 mx-1`}
                            onClick={() => handleRoleChange('customer')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Customer
                        </button>
                        <button
                            type="button"
                            className={`btn ${selectedRole === 'employee' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1 mx-1`}
                            onClick={() => handleRoleChange('employee')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Employee
                        </button>
                        <button
                            type="button"
                            className={`btn ${selectedRole === 'admin' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1 mx-1`}
                            onClick={() => handleRoleChange('admin')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Admin
                        </button>
                    </div>
                    <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={handleSubmit}
                    >
                        Submit Change
                    </button>
                    {confirmation && (
                        <div className="alert alert-success mt-4" role="alert">
                            {`Role of ${confirmedName} changed to ${confirmedRole}!`}
                        </div>
                    )}
                    {message && <div className="alert alert-danger mt-4">{message}</div>}
                </form>
            </div>
        </div>
    );
}