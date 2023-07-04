import express from "express";
const router = new express.Router();
import { user } from "../../controllers/user.js";
import { auth,authorize } from "../../auth/auth.js";

//admin route
router.route("/users").get(auth,authorize("admin"),user.getAllUser);
router.route("/user/:_id")
.get(auth,authorize("admin"),user.getParticularUser)
.delete(auth,authorize("admin"),user.deleteParticularUser)
.patch(auth,authorize("admin"),user.updateRole);

export default router;