import "dotenv/config.js";
import morgan from "morgan";
import express from "express";
import route from "./router/route.js";
import connectDB from "./conn/conn.js";
const app = express();

const PORT = process.env.PORT || 8000;

//Handling Uncaught Exceptions
process.on("uncaughtException",err =>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

app.use(express.json());
app.use(morgan("tiny"));

app.use("/api",route);

const server = app.listen(PORT,async() =>{
    console.log(`Server is listening to the port ${PORT}`);
    await connectDB();
});

// Unhandled Promise rejections
process.on("unhandledRejection",err =>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled promise Rejection`);

    server.close(() =>{
        process.exit(1);
    })
})
