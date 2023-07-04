import { verifyToken } from "../util/jwt.js";
//config
import { message } from "../config/message.js";
import { status } from "../config/status.js";

const auth = async(req,res,next) =>{
    try {
        const token = req.headers.authorization?.replace("Bearer ","");
        
        if(!token) {
            throw new Error("token required!")
        }

        //verify token
        const decodeToken = await verifyToken(token,res);
        
        if(!decodeToken) {
            throw new Error(message.AUTH_FAILED);
        }

        req.token = token;
        req.user = decodeToken;

        next();
    } catch (error) {
       return res.status(401).json({status:status.AUTH_FAILED,message:message.AUTH_FAILED});
    }
}

const authorize = (...role) =>{
    return (req,res,next) =>{
        if(!role.includes(req.user.role)) {
            console.log(req.user.role);
            return res.status(403).json({message : `Role: ${req.user.role} is not allowed to access this resource`});
        }
        next();
    }
}

export { auth,authorize };