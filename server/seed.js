// ============================================================
// NEXUS 9I - TEST STUDENT SEED
// ============================================================

// DNS configuration
const dns = require("dns");

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

// ============================================================
// IMPORTS
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Student = require("./models/Student");

// ============================================================
// CREATE TEST ACCOUNT
// ============================================================

async function seed() {

    try {

        // Check MongoDB URI
        if (!process.env.MONGO_URI) {

            console.error("MONGO_URI is missing from .env ❌");
            process.exit(1);

        }

        // Connect to MongoDB Atlas
        await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 15000
            }
        );

        console.log("MongoDB connected ✅");

        // Test account details
        const userId = "TEST001";
        const password = "Test1234";

        // Check whether account already exists
        const existingStudent = await Student.findOne({
            userId: userId
        });

        if (existingStudent) {

            console.log(
                "TEST001 already exists."
            );

            console.log(
                "You can use:"
            );

            console.log(
                "User ID: TEST001"
            );

            console.log(
                "Password: Test1234"
            );

            await mongoose.connection.close();

            process.exit(0);

        }

        // Hash password
        const passwordHash =
            await bcrypt.hash(password, 10);

        // Create student
        await Student.create({

            userId: userId,

            name: "Test Student",

            rollNo: 1,

            className: "9I",

            passwordHash: passwordHash

        });

        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            "Test student created successfully ✅"
        );

        console.log(
            "User ID: TEST001"
        );

        console.log(
            "Password: Test1234"
        );

        console.log(
            "Role: Student"
        );

        console.log(
            "========================================"
        );

        console.log("");

        // Close connection
        await mongoose.connection.close();

        process.exit(0);

    }

    catch (error) {

        console.error("");
        console.error(
            "Seed error ❌"
        );

        console.error(
            error.message
        );

        console.error("");

        await mongoose.connection.close()
            .catch(() => {});

        process.exit(1);

    }

}

// ============================================================
// RUN
// ============================================================

seed();