const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const app = express()
const connectDb = require('./config/db')
const userRoutes = require('./routes/UserRoutes')
const productRoutes = require("./routes/productRoutes")
app.use(cors())
app.use(express.json())


dotenv.config()
console.log(process.env.PORT);


// connect database
connectDb()
const PORT = process.env.PORT || 3000;

//API Routes
app.use("/api/users", userRoutes);

// product api

app.use("/api/products", productRoutes)

app.get("/", (req, res) => {
    res.send("welcome to a Rabbit Backend API !.....")
})
app.listen(PORT, function () {
    console.log("server Start....", `http://localhost:${PORT}/`)
})