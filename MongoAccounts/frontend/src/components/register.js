import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function updateForm(value) {
        return setForm(prev => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        const newUser = { ...form };

        await fetch("http://localhost:4000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                navigate("/account_summary");
            }
        })
        .catch(error => {
            setError("An error occurred. Please try again.");
        });
    }

    return (
        <div>
            <h3>Register</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={onSubmit}>
                <div>
                    <label>First Name: </label>
                    <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => updateForm({ firstName: e.target.value })}
                    />
                </div>
                <div>
                    <label>Last Name: </label>
                    <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => updateForm({ lastName: e.target.value })}
                    />
                </div>
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm({ email: e.target.value })}
                    />
                </div>
                <div>
                    <label>Phone Number: </label>
                    <input
                        type="text"
                        value={form.phoneNumber}
                        onChange={(e) => updateForm({ phoneNumber: e.target.value })}
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => updateForm({ password: e.target.value })}
                    />
                </div>
                <div>
                    <input type="submit" value="Register" />
                </div>
            </form>
        </div>
    );
}