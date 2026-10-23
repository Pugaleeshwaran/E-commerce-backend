const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// @ route post /api/users/register
// @desc Register a new user
// @access Public

router.post("/register", async (req, res) => {
    console.log(req.body);

    const { name, mail, password } = req.body;
    try {
        // register logic
        let user = await User.findOne({ mail });

        if (user) {
            return (
                res.status(400).json({ message: "User already exits" })
            )
        };
        user = new User({ name, mail, password });
        await user.save();

        // res.status(201).json({
        //     user: user._id,
        //     name: user.name,
        //     mail: user.mail,
        //     role: user.role,
        // })

        // create JWT payload
        const payload = { user: { id: user._id, role: user.role } };

        // sign and return the token along with user data
        jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: "20h" },
            (err, token) => {
                if (err) throw err;


                //send the user and token in response

                res.status(201).json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        mail: user.mail,
                        role: user.role
                    },
                    token
                });
            }

        )
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Server Error ")
    }
});

//@route POST /api/users/login
//@desc Authenticate user
//@access Public

router.post("/login", async (req, res) => {
    const { mail, password } = req.body

    try {
        // find the user by email
        let user = await User.findOne({ mail });

        if (!user) return res.status(400).json({ message: "Invalid Credentials " });
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Enter the Correct Password" });
        }
        // create JWT payload
        const payload = { user: { id: user._id, role: user.role } };

        // sign and return the token along with user data
        jwt.sign(payload,
            process.env.JWT_SECRET,
            { expiresIn: "20h" },
            (err, token) => {
                if (err) throw err;


                //send the user and token in response

                res.json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        mail: user.mail,
                        role: user.role
                    },
                    token
                });
            }

        );
    }
     catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
        
}
})

module.exports = router;