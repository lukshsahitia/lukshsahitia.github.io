import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountSummary() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch("http://localhost:4000/account/summary", {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) {
                navigate("/login");
            } else {
                const userData = await response.json();
                setUser(userData);
            }
        }
        fetchUser();
    }, [navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3>Account Summary</h3>
            <p>First Name: {user.firstName}</p>
            <p>Last Name: {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Phone Number: {user.phoneNumber}</p>
            <button onClick={() => navigate("/account_balances")}>View Balances</button>
            <button onClick={async () => {
                await fetch("http://localhost:4000/logout", {
                    method: "POST",
                    credentials: "include"
                });
                navigate("/login");
            }}>Logout</button>
        </div>
    );
}