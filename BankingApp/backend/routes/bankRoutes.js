const express = require('express');
const router = express.Router();
const dbo = require("../db/conn");
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

/*-----------------------------------------------    Customer Routes    ----------------------------------------------*/
// Route to find a customer by customerID
/* json Example:
{
  "customerID": "12345"
}
*/
router.route('/findCustomer').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection('Customers');
        
        const { customerID } = req.query;

        if (!customerID || typeof customerID !== 'string') {
            return res.status(400).json({ error: 'Invalid input. Ensure customerID is a string.' });
        }

        const customer = await collection.findOne({ customerID });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to add a customer (may have to set accounts to zero)
/* Example Customer: 
{
  "customerID": "12345",
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Maple Street",
  "email": "john.doe@example.com",
  "phone": "555-1234",
  "checking": 500,
  "savings": 0,
  "investment": 0,
  "password": "abc",
  "role": "customer"
}
*/
router.route('/addCustomer').post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Customers");

        const { firstName, lastName, address, email, phone, password, role } = req.body;

        // Validate input
        if (
            !firstName || typeof firstName !== 'string' ||
            !lastName || typeof lastName !== 'string' ||
            typeof password !== 'string' ||
            !role || typeof role !== 'string'
        ) {
            return res.status(400).json({ error: 'Invalid input. Ensure all fields are correctly filled.' });
        }

        // Generate a unique 5-digit customerID
        let customerID;
        let customerExists;

        do {
            customerID = Math.floor(10000 + Math.random() * 90000).toString(); // Generate a random 5-digit number
            customerExists = await collection.findOne({ customerID });
        } while (customerExists);

        // Hash password
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        // Insert new customer
        await collection.insertOne({ 
            customerID, 
            firstName, 
            lastName, 
            address, 
            email, 
            phone,
            checking: 500, // Set default values
            savings: 0,
            investment: 0,
            role,
            hashedPassword
        });

        // Return customerID upon successful insertion
        res.json({ customerID, message: `${firstName} ${lastName} who is a ${role} has been added successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to change a customer's role
/* JSON Example:
{
  "customerID": "12345",
  "newRole": "admin"
}
*/
router.route('/changeCustomerRole').post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection('Customers');

        const { customerID, newRole } = req.body;

        // Validate input
        if (!customerID || typeof customerID !== 'string') {
            return res.status(400).json({ error: 'Invalid input. Ensure customerID is a string.' });
        }

        // Validate role
        if (!['customer', 'employee', 'admin'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role type. Must be customer, employee, or admin.' });
        }

        // Check if customer exists
        const customer = await collection.findOne({ customerID });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        // Update the customer's role
        const result = await collection.updateOne(
            { customerID },
            { $set: { role: newRole } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ error: 'Failed to update customer role.' });
        }

        res.json({ 
            message: `${customer.firstName} ${customer.lastName} role updated to ${newRole} successfully.`,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete all customers
router.route('/deleteCustomers').delete(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Customers");

        const result = await collection.deleteMany({});
        res.json({ message: `All customer have been deleted (deleted documents: ${result.deletedCount})` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/*-----------------------------------------------    Transaction Routes    ----------------------------------------------*/
// Finds all transactions for a customer
/* json Example:
{
  "customerID": "12345",
}
*/
router.route('/customerTransactions').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const transactionsCollection = dbConnect.collection("Transactions");
        const customersCollection = dbConnect.collection("Customers");

        const { customerID } = req.query; // Use req.query for GET request parameters

        // Validate input
        if (!customerID || typeof customerID !== 'string') {
            return res.status(400).json({ error: 'Invalid input. Ensure customerID is a string.' });
        }

        // Check if customer exists
        const customer = await customersCollection.findOne({ customerID });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        // Find all transactions for the customer and sort them by date (most recent)
        const transactions = await transactionsCollection.find({ customerID }).sort({ dateTime: -1 }).toArray();

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Finds all transactions for a customer in a specific account
/* json Example: 
{
  "customerID": "12345",
  "account": "investment"
}
*/
router.route('/customerAccountTransactions').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const transactionsCollection = dbConnect.collection("Transactions");
        const customersCollection = dbConnect.collection("Customers");

        const { customerID, account } = req.query; // Use req.query for GET request parameters

        // Validate input
        if (!customerID || typeof customerID !== 'string' || !['checking', 'savings', 'investment'].includes(account)) {
            return res.status(400).json({ error: 'Invalid input. Ensure customerID is a string and that account is of type checking, savings, or investment.' });
        }

        // Check if customer exists
        const customer = await customersCollection.findOne({ customerID });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        // Find all transactions for the customer and sort them by date (most recent)
        const transactions = await transactionsCollection.find({ customerID, account }).sort({ dateTime: -1 }).toArray();

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// All in one transaction
/* Transaction Examples:
LOCAL TRANSFER: (Use the customerID twice and set isLocal to TRUE)
{
    "fromCustomerID": "12345",
    "fromAccount": "checking",
    "toCustomerID": "12345",
    "toAccount": "savings",
    "amount": 50,
    "isLocal": true
}
FOREIGN TRANSFER: (set isLocal to FALSE)
{
    "fromCustomerID": "12345",
    "fromAccount": "checking",
    "toCustomerID": "67890",
    "toAccount": "savings",
    "amount": 100,
    "isLocal": false
}
*/
router.route('/Transaction').post(async (req, res) => {
    const dbConnect = dbo.getDb();
    const transactionsCollection = dbConnect.collection("Transactions");
    const customersCollection = dbConnect.collection("Customers");

    const { fromCustomerID, fromAccount, toCustomerID, toAccount, amount, isLocal } = req.body;

    // Validate input
    if (
        (!fromCustomerID || typeof fromCustomerID !== 'string') ||
        !toCustomerID || typeof toCustomerID !== 'string' ||
        !fromAccount || typeof fromAccount !== 'string' ||
        !toAccount || typeof toAccount !== 'string' ||
        typeof amount !== 'number' ||
        typeof isLocal !== 'boolean'
    ) {
        return res.status(400).json({ error: 'Invalid input. Ensure all fields are correctly filled.' });
    }

    try {
        // LOCAL TRANSFER: (within the same customer)
        if (isLocal && fromCustomerID === toCustomerID) {
            if (fromAccount === toAccount) {
                return res.status(400).json({ error: 'From account and to account cannot be the same for local transfer.' });
            }

            // Perform the transfer between the customer's accounts
            await customersCollection.updateOne(
                { customerID: fromCustomerID },
                { $inc: { [fromAccount]: -amount, [toAccount]: amount } }
            );

            // Insert unified transaction records
            await transactionsCollection.insertMany([
                {
                    customerID: fromCustomerID,
                    account: fromAccount,
                    amount: -amount,
                    dateTime: new Date()
                },
                {
                    customerID: toCustomerID,
                    account: toAccount,
                    amount: amount,
                    dateTime: new Date()
                }
            ]);

            return res.json({ message: 'Local transfer completed successfully.' });
        } else {
            // FOREIGN TRANSFER: (between different customers)

            // Deduct amount from the sender's account
            await customersCollection.updateOne(
                { customerID: fromCustomerID },
                { $inc: { [fromAccount]: -amount } }
            );

            // Credit amount to the receiver's account
            await customersCollection.updateOne(
                { customerID: toCustomerID },
                { $inc: { [toAccount]: amount } }
            );

            // Insert unified transaction records
            await transactionsCollection.insertMany([
                {
                    customerID: fromCustomerID,
                    account: fromAccount,
                    amount: -amount,
                    dateTime: new Date()
                },
                {
                    customerID: toCustomerID,
                    account: toAccount,
                    amount: amount,
                    dateTime: new Date()
                }
            ]);

            return res.json({ message: 'Foreign transfer completed successfully.' });
        }
    } catch (error) {
        console.error('Error processing transaction:', error);
        return res.status(500).json({ error: 'Failed to process transaction.' });
    }
});

// Route to delete all transactions
router.route('/deleteTransactions').delete(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Transaction");

        const result = await collection.deleteMany({});
        res.json({ message: `All transactions have been deleted (deleted documents: ${result.deletedCount})` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;