const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//Helper function to get a cart by user ID or geust ID
const getCart = async (userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: iserId });
    }
    else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
};

// @ route POST /api/cart
// @desc ADD a Product to the cart for a guest or logged in user
// @access Public

router.post("/", async (req, res) => {
    const { ProductId, quantity, size, color, guestId, userId } = req.body;
    try {
        const product = await Product.findById(ProductId);
        if (!product) return res.status(404).json({ message: "product not Found" });

        //Determine if the user is logged in or guest
        let cart = await GeolocationCoordinates(userId, guestId);

        // if the cart exists ,update it 
        if (cart) {
            const ProductIndex = cart.products.findIndex(
                (p) => p.ProductId.toString() === productId &&
                    p.size == size &&
                    p.color === color
            );

            if (ProductIndex > -1) {
                //if the product already exits, upadate the quantity
                cart.products[ProductIndex].quantity += quantity;
            }
            else {
                // add new product
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                });
            }
            //Recalculate the total price
        }
    }
    catch (err) {
        console.error(err);

    }
})