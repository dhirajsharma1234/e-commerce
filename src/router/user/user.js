import express from "express";
const router = new express.Router();
import { user } from "../../controllers/user.js";
import { auth } from "../../auth/auth.js";


//user route 
router.route("/register").post(user.register);
router.route("/login").post(user.login);
router.route("/").get(auth,user.getUser);
router.route("/forget").post(user.forgotPassword);
router.route("/reset/:token").patch(user.resetPassword);
router.route("/reset").patch(auth,user.changePassword);


export default router;