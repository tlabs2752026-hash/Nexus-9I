// ============================================================
// NEXUS 9I - ADMIN ACCOUNT SEED
// ============================================================

const dns = require("dns");

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Admin = require("./models/Admin");

// ============================================================
// CREATE ADMIN
// ============================================================

async function seedAdmin() {

    try {

        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is missing from .env ❌");
            process.exit(1);
        }

        await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 15000,
                connectTimeoutMS: 15000
            }
        );

        console.log("MongoDB connected ✅");

        // Admin account details
        const userId = "ADMIN001";
        const password = "Admin1234";

        // Check existing admin
        const existingAdmin = await Admin.findOne({
            userId: userId
        });

        if (existingAdmin) {

            console.log("ADMIN001 already exists.");

            await mongoose.connection.close();

            process.exit(0);
        }

        // Hash password
        const passwordHash =
            await bcrypt.hash(password, 10);

        // Create admin
        await Admin.create({

            userId: userId,

            name: "Nexus 9I Administrator",

            passwordHash: passwordHash

        });

        console.log("");
        console.log("========================================");
        console.log("Admin account created successfully ✅");
        console.log("User ID: ADMIN001");
        console.log("Password: Admin1234");
        console.log("Role: Admin");
        console.log("========================================");
        console.log("");

        await mongoose.connection.close();

        process.exit(0);

    }

    catch (error) {

        console.error("");
        console.error("Admin seed error ❌");
        console.error(error.message);
        console.error("");

        await mongoose.connection.close()
            .catch(() => {});

        process.exit(1);
    }
}

// ============================================================
// RUN
// ============================================================

seedAdmin();