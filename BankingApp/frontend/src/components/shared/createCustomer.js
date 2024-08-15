import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// This function gives admin and employee users the ability to create a new customer
export default function CreateCustomer() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState(''); // Add password state
    const [selectedRole, setSelectedRole] = useState('');
    const [confirmation, setConfirmation] = useState(false);
    const [confirmedFirstName, setConfirmedFirstName] = useState('');
    const [confirmedLastName, setConfirmedLastName] = useState('');
    const [error, setError] = useState('');

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async () => {
        if (firstName && lastName && address && email && phone && selectedRole && password) {
            try {
                // Post request to add a new customer
                const response = await axios.post('http://localhost:4000/addCustomer', {
                    firstName,
                    lastName,
                    address,
                    email,
                    phone,
                    password,
                    role: selectedRole
                });
    
                const newCustomerID = response.data.customerID;
                console.log('New customer ID:', newCustomerID);
    
                setConfirmedFirstName(firstName);
                setConfirmedLastName(lastName);
                setConfirmation(true);
                setError('');
    
                // Display the new customer ID to the user
                alert(`Customer ${firstName} ${lastName} created successfully with Customer ID: ${newCustomerID}`);
    
                // Clear input fields
                setFirstName('');
                setLastName('');
                setAddress('');
                setEmail('');
                setPhone('');
                setPassword('');
                setSelectedRole('');
    
                setTimeout(() => {
                    setConfirmation(false);
                }, 3000);
    
            } catch (err) {
                setError('Failed to add customer. Please try again.');
                console.error(err);
            }
        } else {
            setError('Please fill in all fields and select a role.');
        }
    };    

    return (
        <div className="container my-4">
            <div className="card p-4 shadow-sm">
                <h1 className="text-center mb-4">Create New Customer</h1>
                <form>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
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
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="address"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            className={`btn ${selectedRole === 'administrator' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1 mx-1`}
                            onClick={() => handleRoleChange('administrator')}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Administrator
                        </button>
                    </div>
                    {error && (
                        <div className="alert alert-danger mt-4" role="alert">
                            {error}
                        </div>
                    )}
                    <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                    {confirmation && (
                        <div className="alert alert-success mt-4" role="alert">
                            {`Customer ${confirmedFirstName} ${confirmedLastName} created successfully!`}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}