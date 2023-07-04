import express from "express";
const router = new express.Router();
import { order } from "../../controllers/order/order.js";
import { auth,authorize } from "../../auth/auth.js";

router.route("/order/new").post(auth,order.newOrder);
router.route("/order/:id").get(auth,order.getSingleOrder);
router.route("/orders/me").get(auth,order.getAllOrder);

//admin
router.route("/admin/orders").get(auth,authorize("admin"),order.getAllOrders);

router.route("/admin/order/:id")
.patch(auth,authorize("admin"),order.updateOrderStatus)
.delete(auth,authorize("admin"),order.deleteOrder);

export default router;