import { Order } from "../../model/Order.js";
import { status } from "../../config/status.js";
import Product from "../../model/Product.js";
import { orderMessage } from "../../config/orderMessage.js";


//update stock
const updateStock = async(id,quantity) =>{
    try {
        const product = await Product.findById(id);
        product.stock -= quantity;
        await product.save({ validateBeforeSave:false });
    } catch (error) {
        throw new Error(error.message);
    }
}

class Orders {

    newOrder = async(req,res) =>{
        try {
            const { shippingInfo,orderItem,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice } = req.body;

            const order = await Order.create({
                shippingInfo,
                orderItem,
                paymentInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paidAt:Date.now(),
                user:req.user._id,
            });

            return res.status(201).json({status:status.SUCCESS,order});
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    getSingleOrder = async(req,res) =>{
        try {
            const { id } = req.params;

            const order = await Order.findOne({ _id:id }).populate("user","name email");

            if(!order) {
                return res.status(404).json({status:status.NOT_FOUND,message: orderMessage.ORDER_NOT_FOUND});
            }

            return res.status(200).json({status:status.SUCCESS,order})
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    //get all order of users
    getAllOrder = async(req,res) =>{
        try {
            const order = await Order.find({user: req.user._id }).populate("user","name email");

            if(!order) {
                return res.status(404).json({status:status.NOT_FOUND,message: orderMessage.ORDER_NOT_FOUND});
            }

            return res.status(200).json({status:status.SUCCESS,order})
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    //get all order -- Admin
    getAllOrders = async(req,res) =>{
            try {
                const order = await Order.find({});
    
                if(!order) {
                    return res.status(404).json({status:status.NOT_FOUND,message: orderMessage.ORDER_NOT_FOUND});
                }

                let totalAmount =0;
                order.forEach(val => totalAmount+=val.totalPrice);
    
                return res.status(200).json({status:status.SUCCESS,order,totalAmount})
            } catch (error) {
                return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
            }
    }

     //update order -- Admin
    updateOrderStatus = async(req,res) =>{
        try {
            const { id } = req.params;
            const orderStatus = req.body.status;

            const order = await Order.findOne({ _id:id });

            if(!order) {
                return res.status(404).json({status:status.NOT_FOUND,message: orderMessage.ORDER_NOT_FOUND});
            }

            if(order.orderStatus === "Delivered") {
                return res.status(404).json({status:status.BAD_REQUEST,message: orderMessage.ALREADY_DELIVERED});
            }

            order.orderItem.forEach(async order => await updateStock(order.product,order.quantity));

            order.orderStatus = orderStatus;

            if(orderStatus === "Delivered") {
                order.deliveredAt = Date.now();
            }

            await order.save({ validateBeforeSave:false });

            return res.status(200).json({status:status.SUCCESS,message: orderMessage.ORDER_STATUS_UPDATED});
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }

    //delete order --Admin
    deleteOrder = async(req,res) =>{
        try {
            const { id } = req.params;

            const order = await Order.findOne({ _id:id });

            if(!order) {
                return res.status(404).json({status:status.NOT_FOUND,message: orderMessage.ORDER_NOT_FOUND});
            }

            await Order.findByIdAndDelete({ _id:id });

            return res.status(200).json({status:status.SUCCESS,message: orderMessage.ORDER_DELETED});
        } catch (error) {
            return res.status(400).json({status:status.BAD_REQUEST,message:error.message});
        }
    }


}

const order = new Orders();
export { order };