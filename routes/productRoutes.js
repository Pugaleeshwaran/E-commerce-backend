const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// @route POST /api/products
// @desc Create a new Product
// @access Private/Admin

router.post("/", protect, admin, async (req, res) => {
    try {
        const { name, description, price
            , discountPrice, countInStock, sku,
            category, brand, sizes, colors,
            collections, material, gender, images,
            isFeatured, isPublished, tags, dimenstions
            , weight
        } = req.body;

        const product = new Product({
            name, description, price
            , discountPrice, countInStock, sku,
            category, brand, sizes, colors,
            collections, material, gender, images,
            isFeatured, isPublished, tags, dimenstions
            , weight,
            user: req.user._id,// reference to the admin user who created it
        });

        const createProduct = await product.save()
        res.status(201).json(createProduct)
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error")

    }
});

// @route PUT /api/products/:id
// @desc Update an existing product ID
// @access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
    try {
        const { name, description, price
            , discountPrice, countInStock, sku,
            category, brand, sizes, colors,
            collections, material, gender, images,
            isFeatured, isPublished, tags, dimenstions
            , weight
        } = req.body;

        //Find product by ID
        console.log("Id Param", req.params);

        const product = await Product.findById(req.params.id)

        if (product) {
            //update product fields
            console.log(product);
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.sku = sku || product.sku;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished !== undefined ? isPublished : product.isPublished
            product.tags = tags || product.tags
            product.dimenstions = dimenstions || product.dimenstions
            product.weight = weight || product.weight

            // save the updated product

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        }
        else {
            res.status(404).json({ message: "Product not found" })
        }
    }
    catch (err) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


// @route DELETE /api/products/:id
// @desc Delete a product by ID
// @access Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {

    try {
        //find product by ID
        const product = await Product.findById(req.params.id)
        if (product) {
            //remove the product from DB
            await product.deleteOne();
            res.json({ message: "Product Removed" });
        }
        else {
            res.status(404).json({ message: "Product not Found" })
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server Error")
    }

});


// @route GET /api/products
// @desc get all product with optional query filters
// @access Public

router.get("/", async (req, res) => {
    try {
        const { collection, size, color, gender, minPrice, MaxPrice, sortBy,
            search, category, material, brand, limit
        } = req.query;

        let query = {};
        //filter Logic

        if (collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }
        if (category && category.toLocaleLowerCase() !== "all") {
            query.categorys = category;
        }

        if (material) {
            query.material = { $in: material.split(",") };
        }
        if (brand) {
            query.brand = { $in: brand.split(",") };
        }
        if (size) {
            query.size = { $in: size.split(",") };
        }
        if (color) {
            query.color = { $in: [color] };
        }
        if (gender) {
            query.gender = gender;
        }
        if (minPrice || MaxPrice) {
            query.price = {};
            //gte or lte mean Greater or less then equal to >=
            if (minPrice) query.price.gte = Number(minPrice);
            if (MaxPrice) query.price.lte = Number(MaxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }

        //sort Logic
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 }
                    break;
                case "popularity":
                    sort: { rating: -1 }
                    break;
                default:
                    break;
            }
        }

        //Fetch products and apply sorting and Limit
        let Products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
        res.json(Products);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("server Error");

    }
})
module.exports = router;