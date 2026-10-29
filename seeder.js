const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User")
const Cart = require("./models/Cart")
const products = require("./data/products")

dotenv.config()

// connect with db

mongoose.connect(process.env.MONGO_URI);

// funtion to data seed
const seedData = async () => {
    try {
        // create existing data
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        // Create a default admin User
        const createdUser = await User.create({
            name: "Admin User",
            mail: "admin@example.com",
            password: "123456",
            role: "admin",
        });

        //Assign the default user ID to each Product
        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return (
                { ...product, user: userID });

        });

        //insert the product into database
        await Product.insertMany(sampleProducts);
        console.log("Product data seeded Successfully");
        process.exit();

    }
    catch (err) {
        console.error("error seeding the data:", err);
        process.exit(1);
    }
};

seedData()