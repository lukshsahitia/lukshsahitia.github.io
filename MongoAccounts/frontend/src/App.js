import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./components/register.js";
import Login from "./components/login.js";
import AccountSummary from "./components/account_summary.js";
import AccountBalances from "./components/account_balances.js";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/account_summary" element={<AccountSummary />} />
        <Route path="/account_balances" element={<AccountBalances />} />
      </Routes>
    </div>
  );
};

export default App;