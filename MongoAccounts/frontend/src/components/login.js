import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
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

        const user = { ...form };

        await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
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
            <h3>Login</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={onSubmit}>
                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm({ email: e.target.value })}
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
                    <input type="submit" value="Login" />
                </div>
            </form>
        </div>
    );
}