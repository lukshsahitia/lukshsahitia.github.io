import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminDashboard from "./components/admin/adminDashboard";
import CustomerDashboard from "./components/customer/customerDashboard";
import EmployeeDashboard from "./components/employee/employeeDashboard";
import AccountDetails from "./components/shared/accountDetails";
import CreateCustomer from "./components/shared/createCustomer";
import Login from "./components/shared/login";
import MoneyTransfer from "./components/shared/moneyTransfer";
import PromotionDemotion from "./components/shared/promotionDemotion";
import SearchCustomer from "./components/shared/searchCustomer";
import TransactionHistory from "./components/shared/transactionHistory";
import TransferBetweenCustomers from "./components/shared/transferBetweenCustomers";

const App = () => {
  const [user, setUser] = useState(null); // State to hold user details

  return (
    <div>
      <Routes>
        <Route path="/adminDashboard" element={<AdminDashboard user={user} />} />
        <Route path="/customerDashboard" element={<CustomerDashboard user={user} />} />
        <Route path="/employeeDashboard" element={<EmployeeDashboard user={user} />} />
        <Route path="/accountDetails" element={<AccountDetails />} />
        <Route path="/createCustomer" element={<CreateCustomer />} />
        <Route path="/" element={<Login setUser={setUser} />} /> 
        <Route path="/moneyTransfer" element={<MoneyTransfer />} />
        <Route path="/promotionDemotion" element={<PromotionDemotion />} />
        <Route path="/searchCustomer" element={<SearchCustomer />} />
        <Route path="/transactionHistory" element={<TransactionHistory />} />
        <Route path="/transferBetweenCustomers" element={<TransferBetweenCustomers />} />
      </Routes>
    </div>
  );
};

export default App;