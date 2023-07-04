import mongoose from "mongoose";
import Product from "../../model/Product.js";
//config
import { status } from "../../config/status.js";
import { productMessage } from "../../config/productMessage.js";
import { ApiFeatures } from "../../util/apiFeatures.js";


class Products {

    createProducts = async(req,res) =>{
        try {
            // req.body.user = req.user._id;
            const { _id } = req.user;
            await Product.create({...req.body,user:_id});

            return res.status(200).json({ status:status.CREATED,message:productMessage.CREATE_PRODUCT });
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    getAllProducts = async(req,res) =>{
        try {
            // const { minPrice,maxPrice } = req.query;
            // const { search } = req.query;

            // let searchProduct = {};
            
            // if(search) {
            //     const searchTerm = new RegExp(search.toLowerCase(),"i");
            //     searchProduct.$or = [{ name: searchTerm }, { description: searchTerm }];
            // }
            
            // if(minPrice && maxPrice) {
            //     searchProduct = {
            //         price:{
            //             $gte:Number(minPrice),
            //             $lte:Number(maxPrice)
            //         }
            //     }
            // }

            // const products = await Product.find(searchProduct);

            const resultPerPage = 5; 
            const countProduct = await Product.countDocuments({})
            const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().paginate(resultPerPage);
            const products = await apiFeature.query;

            return res.status(200).json({ status:status.SUCCESS,products,count:countProduct });
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    updateProduct = async(req,res) =>{
        try {
            const { id } = req.params;
            const { name,price,description,images,category,stock,reviews } = req.body;

            const product = await Product.findOne({ _id:id }).select("_id");
            
            if(!product) {
                return res.status(404).json({ status:status.NOT_FOUND,message:productMessage.PRODUCT_NOT_FOUND});
            }

            const obj = {
                name,
                price,
                description,
                images,
                category,
                stock,
                reviews,
              };

            const update = await Product.findOneAndUpdate({ _id:id },obj,{ new:true });

            if(!update) {
                return res.status(400).json({ status:status.BAD_REQUEST,message:productMessage.SOMETHING_WENT_WRONG});
            }

            return res.status(200).json({ status:status.SUCCESS,message:productMessage.UPDATE_PRODUCT});
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    deleteProduct = async(req,res) =>{
        try {
            const { id } = req.params;

            const product = await Product.findOne({ _id:id });
            
            if(!product) {
                return res.status(404).json({ status:status.NOT_FOUND,message:productMessage.PRODUCT_NOT_FOUND});
            }

            await Product.findByIdAndDelete({ _id:id });

            return res.status(200).json({ status:status.SUCCESS,message:productMessage.DELETE_PRODUCT});
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    getProductDetails = async(req,res) =>{
        try {
            const { id } = req.params;

            const product = await Product.findOne({ _id:id });
            
            if(!product) {
                return res.status(404).json({ status:status.NOT_FOUND,message:productMessage.PRODUCT_NOT_FOUND});
            }

            return res.status(200).json({ status:status.SUCCESS,product});
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    //create new review and update review
    createProductReview = async(req,res) =>{
        try {
            const { rating,comment,productId } = req.body;

            const review = {
                user: req.user._id,
                name:req.user.name,
                rating:Number(rating),
                comment
            }


            const product = await Product.findOne({ _id: productId });

            const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

            console.log(isReviewed);
            if(isReviewed) {
                product.reviews.forEach(rev => {
                    if(rev.user.toString() === req.user._id.toString()) {
                        (rev.rating = rating),(rev.comment = comment);
                    }
                }); 
            }
            else {
                product.reviews.push(review);
                product.noOfReviews = product.reviews.length;
            }

            let avg = 0;
            product.reviews.forEach((val) =>{
                avg+=val.rating;
            })
            product.ratings =  (avg/product.reviews.length).toFixed(2);

            await product.save({ validateBeforeSave: false });

            return res.status(200).json({status:status.SUCCESS,message:productMessage.REVIEW_ADD});
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    //get all reviews of the product
    getAllReview = async(req,res) =>{
        try {
            const { id } = req.query;

            const product = await Product.findOne({ _id:id });

            if(!product) {
                return res.status(404).json({ status:status.NOT_FOUND,message:productMessage.PRODUCT_NOT_FOUND });
            }

            return res.status(200).json({ status:status.SUCCESS,reviews:product.reviews });

        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }

    deleteProductReview = async(req,res) =>{
        try {
            const { id,reviewId } = req.query;

            const product = await Product.findOne({ _id:id });

            if(!product) {
                return res.status(404).json({ status:status.NOT_FOUND,message:productMessage.PRODUCT_NOT_FOUND });
            }

            const reviews = product.reviews.filter((val) => val._id.toString() != reviewId.toString());

            let avg = 0;
            reviews.forEach((val) =>{
                avg+=val.rating;
            })
            
            const ratings =  (avg/reviews.length).toFixed(2);
            const noOfReviews = reviews.length;

            await Product.findByIdAndUpdate({ _id:id },{
                $set:{
                    ratings,noOfReviews,reviews
                }
            },{ new:true });

            return res.status(200).json({ status:status.SUCCESS,message:productMessage.REVIEW_DELETE });
        } catch (error) {
            return res.status(400).json({ status:status.BAD_REQUEST,message:error.message });
        }
    }
 
}

const product = new Products();
export { product };