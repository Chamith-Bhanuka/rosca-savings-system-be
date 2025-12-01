import express = require("express");
import dotenv from "dotenv";

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;

const app = express();

app.use(express.json());

app.use('/',(req, res) => {
    res.send('Backend is running..!');
})

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});