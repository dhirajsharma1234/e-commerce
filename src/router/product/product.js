import express from "express";
const router = new express.Router();
import { product } from "../../controllers/product/product.js";
import { auth,authorize } from "../../auth/auth.js";


router.route("/product/new").post(auth,authorize("admin"),product.createProducts);
router.route("/products").get(auth,product.getAllProducts);

router.route("/product/:id")
.patch(auth,authorize("admin"),product.updateProduct)
.delete(auth,authorize("admin"),product.deleteProduct)
.get(product.getProductDetails);

router.route("/product/new/review").patch(auth,product.createProductReview);

//get all reviews of the product
router.route("/product/new/reviews")
.get(product.getAllReview)
.delete(product.deleteProductReview);


export default router;