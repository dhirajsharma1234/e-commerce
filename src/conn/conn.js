import mongoose from "mongoose";


const connectDB = async() =>{
    try {
        const URL = process.env.DB_URL;
        const conn = await mongoose.connect(URL);

        if(conn) {
            console.log("DB connected successfully...........");
        }

    } catch (error) {
        throw new Error(error.message);
    }
}

export default connectDB;