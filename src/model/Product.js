import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"Please Enter product name"]
    },
    description:{
        type:String,
        required:[true,"Please Enter product description"]
    },
    price:{
        type:Number,
        required:[true,"Please Enter product price"],
        maxLength:[8,"Price cannot exceed 8 characters"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    category:{
        type:String,
        required:[true,"Please Enter product category"],
    },
    stock:{
        type:Number,
        required:[true,"Please Enter product Stock"],
    },
    noOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Types.ObjectId,
                ref: "User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Types.ObjectId,
        ref: "User",
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
},
{
    timestamps:true
});

const Product =  new mongoose.model("Product",productSchema);

export default Product;