import jwt  from "jsonwebtoken";
import User from "../model/user.js";

const createToken = async(_id) =>{
    try {
        const token = await jwt.sign({ _id,date: Date.now() / 1000 },process.env.JWT_SECRET, {
            expiresIn: "2h",
          });
        return token;
    } catch (error) {
        throw new Error(error.message);
    }
}

const verifyToken = async(token) =>{
    try {
        const verifyUser = await jwt.verify(token,process.env.JWT_SECRET);

        //check user
        const user = await User.findOne({ _id:verifyUser._id });
        if(!user) {
            throw new Error(message.AUTH_FAILED);
        }

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

export { createToken,verifyToken };