const mongoose = require("mongoose")

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        console.log("DB connected Suceessflly");
    }
    catch (err) {
        console.error("fail to connect", err)
        process.exit(1);
    }
}
module.exports = connectDb