const jwt = require("jsonwebtoken");
const User = require("../models/User");

//middleware to protect router

const protect = async (req, res, next) => {
    let token;
    console.log(req.headers.authorization);

    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.user.id).select("-password");//exclude password
            next()
        }
        catch (err) {
            console.error("Token verification failed", err);
            res.status(401).json({ message: "Not authorized,token failded" })

        }
    }
    else {
        res.status(401).json({ message: "No authorized,no token provided" })
    }
}

//middleware to check of the user is an admin

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized as an Admin" })
    }
}

module.exports = { protect, admin };