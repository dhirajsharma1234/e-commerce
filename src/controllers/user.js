import crypto from "crypto";
import User from "../model/user.js";
//util
import { encryptPass, decryptPass } from "../util/encryptDecrypt.js";
import { createToken } from "../util/jwt.js";
import { sendingMail } from "../util/sendMail.js";
//config
import { status } from "../config/status.js";
import { message } from "../config/message.js";

class Users {
    register = async(req,res) =>{

        try {
            const { name,email,password } = req.body;

            if(!name || !email || !password) {
                return res.status(406).json({
                    status:status.NOT_ACCEPTABLE,
                    message:message.EMPTY_FIELD
                });
            }
    
            //check user
            const checkUser = await User.findOne({ email });
    
            if(checkUser) {
                return res.status(400).json({
                    status:status.BAD_REQUEST,
                    message:message.ALREADY_REGISTERED
                });
            }
    
            const encryptPassword = await encryptPass(password);
            
            const userData = new User({
                name,
                email,
                password:encryptPassword 
            });
    
            const user = await userData.save();
    
            const token = await createToken(user._id);
    
            return res.status(201).json({
                status:status.CREATED,
                message:message.REGISTERED,
                token
            });  
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    login = async(req,res) =>{
        try {
            const { email,password } = req.body;

            if(!email || !password) {
                return res.status(406).json({
                    status:status.NOT_ACCEPTABLE,
                    message:message.EMPTY_FIELD
                });
            }
    
            const user = await User.findOne({ email }).select("+password");
           
            if(!user) {
                return res.status(404).json({
                    status:status.NOT_FOUND,
                    message:message.NOT_REGISTERED
                });
            }
    
            const decrypt = await decryptPass(password,user.password);
    
            if(!decrypt) {
                  return res.status(401).json({status:400,message:message.LOGIN_FAILED})
            }
    
            const token = await createToken(user._id);
    
            return res.status(200).json({status:200,message:message.LOGIN_SUCCESS,token});
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
       
    }

    getUser = async(req,res) =>{
        try {
            const { _id } = req.user;

            const user = await User.findOne({ _id });

            if(!user) {
                return res.status(404).json({
                    status:status.NOT_FOUND,
                    message:message.USER_NOT_FOUND
                })
            }

            return res.status(200).json({
                status:status.SUCCESS,
                data:user
            });
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    forgotPassword = async(req,res) =>{
        try {
            
            const { email } = req.body;

            const user = await User.findOne({ email });

            if(!user) {
                return res.status(400).json({status:status.NOT_FOUND,message:message.USER_NOT_FOUND});
            }

            //generate random bytes
            const randomBytes = crypto.randomBytes(9).toString('hex');
            const link = `${req.protocol}://${req.get("host")}/api/user/reset/${randomBytes}`; 
            const sendMail = await sendingMail("FORGET_PASS",user,link);

            user.token = randomBytes;
            user.tokenExpiry = Date.now() + 2 * 1000 * 60; 
            await user.save();

            return res.status(200).json({status:status.SUCCESS,message:message.FORGET_PASS});
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    resetPassword = async(req,res) =>{
        try {
            const { token } = req.params;

            const { password,confirmPassword } = req.body;

            if(!password || !confirmPassword) {
                return res.status(400).json({status:status.NOT_ACCEPTABLE,message:message.EMPTY_FIELD});
            }

            if(password != confirmPassword) {
                return res.status(400).json({status:status.BAD_REQUEST,message:message.PASSWORD_NOT_MATCH});
            }

            const user = await User.findOne({ token,tokenExpiry:{ $gt: Date.now() } });

            if(!user) {
                return res.status(400).json({status:status.BAD_REQUEST,message:message.TOKEN_EXPIRED});
            }

            //hash password
            const hashPass = await encryptPass(password);

            await User.findByIdAndUpdate({_id:user._id},{
                $set:{
                    password:hashPass
                },
                $unset:{
                    token:1,
                    tokenExpiry:1
                }
            })

            return res.status(200).json({status:status.SUCCESS,message:message.PASSWORD_CHANGE});
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    changePassword = async(req,res) =>{
        try {
            const { oldPassword,newPassword,confirmPassword } = req.body;

            const user = await User.findOne({_id:req.user._id}).select("+password");

            if(!user) {
                return res.status(400).json({status:status.BAD_REQUEST,message:message.TOKEN_EXPIRED});
            }

            if(oldPassword===newPassword) {
                return res.status(406).json({status:status.NOT_ACCEPTABLE,message:message.PASS_DIFFER});
            }
            if(newPassword != confirmPassword) {
                return res.status(406).json({status:status.NOT_ACCEPTABLE,message:message.PASSWORD_NOT_MATCH});
            }

            const isPasswordMatched = await decryptPass(oldPassword,user.password);

            if(!isPasswordMatched) {
                return res.status(400).json({status:status.BAD_REQUEST,message:message.PASSWORD_NOT_MATCH});
            }
            
            //hash new password
            const hashPass = await encryptPass(newPassword);
            user.password = hashPass;
            await user.save();

            return res.status(200).json({status:status.SUCCESS,message:message.PASSWORD_CHANGE});

        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    //get all users (Admin)
    getAllUser = async(req,res) =>{
        try {
            const users = await User.find({});

            return res.status(200).json({
                status:status.SUCCESS,
                users
            });
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    //update role of user (Admin)
    updateRole = async(req,res) =>{
        try {
            const { name,email,role } = req.body;
            const { _id } = req.params;

            const userUpdate = await User.findByIdAndUpdate({ _id },{
                name,email,role
            },{ new:true });

            if(!userUpdate) {
                return res.status(400).json({
                    status:status.BAD_REQUEST,
                    message:message.SOMETHING_WRONG
                });
            }
             
            return res.status(200).json({
                status:status.SUCCESS,
                message:message.PROFILE_UPDATE
            });
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    //get single user (Admin)
    getParticularUser = async(req,res) =>{
        try {
            const { _id } =req.params;
            const user = await User.findOne({_id});

            if(!user) {
                return res.status(400).json({status:status.NOT_FOUND,message:message.USER_NOT_FOUND});
            }

            return res.status(200).json({
                status:status.SUCCESS,
                user
            });
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

     //delete single user (Admin)
    deleteParticularUser= async(req,res) =>{
        try {
            const { _id } =req.params;
            const user = await User.findOne({_id});

            if(!user) {
                return res.status(400).json({status:status.NOT_FOUND,message:message.USER_NOT_FOUND});
            }

            await User.findOneAndDelete({_id:user._id});

            return res.status(200).json({
                status:status.SUCCESS,
                message:message.USER_REMOVE
            });
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

}

const user = new Users();

export { user };