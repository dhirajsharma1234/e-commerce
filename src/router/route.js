import express from "express";
const router = new express.Router();
import userRouter from "./user/user.js";
import adminRouter from "./user/admin.js";
import productRouter from "./product/product.js";
import orderRouter from "./order/order.js";

router.use("/user",userRouter);
router.use("/admin",adminRouter);
router.use("/",productRouter);
router.use("/",orderRouter);

export default router;