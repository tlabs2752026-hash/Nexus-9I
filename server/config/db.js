// ============================================================
// NEXUS 9I - MONGODB DATABASE CONNECTION
// ============================================================

const mongoose = require("mongoose");


// ============================================================
// CONNECT TO MONGODB
// ============================================================

const connectDB = async () => {

    try {

        // Get MongoDB URI from .env
        const mongoURI = process.env.MONGO_URI;

        // Check if URI exists
        if (!mongoURI) {

            console.error(
                "MongoDB connection failed ❌"
            );

            console.error(
                "MONGO_URI is missing from .env"
            );

            process.exit(1);

        }


        // Connect to MongoDB Atlas
        await mongoose.connect(
            mongoURI,
            {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000
            }
        );


        console.log(
            "MongoDB connected successfully ✅"
        );

    }

    catch (error) {

        console.error(
            "MongoDB connection failed ❌"
        );

        console.error(
            error.message
        );

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = connectDB;