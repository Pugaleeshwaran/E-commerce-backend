const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    mail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please enter a valid email addresss"]
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    }
},
    { timestamps: true }
);


//password Hash middleware

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

// match user entered password to hashed password

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password)
};

module.exports = mongoose.model("User", userSchema)