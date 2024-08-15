import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AccountBalances() {
    const [balances, setBalances] = useState(null);
    const [transaction, setTransaction] = useState({
        amount: "",
        accountType: "checking",
        action: "deposit"
    });
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchBalances() {
            const response = await fetch("http://localhost:4000/account/balances", {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) {
                navigate("/login");
            } else {
                const balanceData = await response.json();
                setBalances(balanceData);
            }
        }
        fetchBalances();
    }, [navigate]);

    function updateTransaction(value) {
        return setTransaction(prev => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        const url = transaction.action === "deposit" ? "/record/account/deposit" : "/record/account/withdraw";

        await fetch(`http://localhost:4000${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: balances.email,
                amount: parseFloat(transaction.amount),
                accountType: transaction.accountType
            }),
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                navigate("/account_summary");
            }
        })
        .catch(error => {
            alert("An error occurred. Please try again.");
        });
    }

    if (!balances) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h3>Account Balances</h3>
            <p>Checking: {balances.checking}</p>
            <p>Savings: {balances.savings}</p>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Amount: </label>
                    <input
                        type="number"
                        value={transaction.amount}
                        onChange={(e) => updateTransaction({ amount: e.target.value })}
                    />
                </div>
                <div>
                    <label>Account Type: </label>
                    <select
                        value={transaction.accountType}
                        onChange={(e) => updateTransaction({ accountType: e.target.value })}
                    >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                    </select>
                </div>
                <div>
                    <label>Action: </label>
                    <select
                        value={transaction.action}
                        onChange={(e) => updateTransaction({ action: e.target.value })}
                    >
                        <option value="deposit">Deposit</option>
                        <option value="withdraw">Withdraw</option>
                    </select>
                </div>
                <div>
                    <input type="submit" value="Submit" />
                </div>
            </form>
        </div>
    );
}
