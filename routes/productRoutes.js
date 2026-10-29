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
        const {
            collection,
            sizes, colors, gender, minPrice, MaxPrice, sortBy,
            search, category, materials, brand, limit
        } = req.query;

        console.log(req.query);
        console.log("value", materials);


        let query = {};
        //filter Logic

        if (collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }
        console.log("dei", query);

        if (category && category.toLocaleLowerCase() !== "all") {
            console.log("it", category)

            query.category = category;
        }

        if (materials) {
            query.material = { $in: materials.split(",") };
            console.log(materials);

        }
        if (brand) {
            query.brand = { $in: brand.split(",") };
        }
        if (sizes) {
            query.sizes = { $in: sizes.split(",") };
        }
        if (colors) {
            query.colors = { $in: [colors] };
        }
        if (gender) {
            query.gender = gender;
        }
        if (minPrice || MaxPrice) {
            query.price = {};
            //$gte or $lte mean Greater or less then equal to >=
            if (minPrice) query.price.$gte = Number(minPrice);
            if (MaxPrice) query.price.$lte = Number(MaxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }

        //sort Logic
        let sort = {};
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
});

// @route GET /api/products/best-seller
// @desc Retrieve the product with highest rating
// @access Public

router.get("/best-seller", async (req, res) => {
    try {
        const bestSeller = await Product.findOne().sort({ rating: -1 });

        if (bestSeller) {
            res.json(bestSeller);
        } else {
            res.status(404).json({ message: "No best Seller found" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send("server error")

    }
})

// @route GET /api/products/new-arrivals
// @desc Retirve latest 8 Product - Create date
// access public

router.get("/new-arrivals", async (req, res) => {
    try {
        const newArrivals = await Product.find().sort({ createAt: -1 }).limit(8);
        if (newArrivals) {
            res.send(newArrivals)
        }
    } catch (err) {
        console.error(err);
        res.status(404).send("server error")
    }
});

// @route GET /api/products/:id
// @desc Get a single product by ID
// @access Public

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: "Product not Found" })
        }
    }
    catch (err) {
        console.log(err);

        res.status(500).send("Server Error")
    };
});

// @route GET /api/products/similar/:id
// @desc Retrieve similer products based on the current on the current product's gender and category
// access Public

router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
        if (!product) {
            res.status(404).json({ message: "Product not found" })
        }
        const similarProducts = await Product.find({
            _id: { $ne: id },//exclude the current product ID
            gender: product.gender,
            category: product.category,
        }).limit(4)
        res.json(similarProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


module.exports = router;