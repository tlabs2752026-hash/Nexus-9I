const readline = require("readline");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const Admin = require("../models/Admin");
const connectDB = require("../config/db");

dotenv.config();

const admins = [
    {
        userId: "A09INT",
        name: "Tejamani Utsav Korada"
    },
    {
        userId: "A09INV",
        name: "Venkata Rithvik Varma Penmasta"
    },
    {
        userId: "A09INJ",
        name: "Jahnavi Palaparthi"
    }
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    try {
        await connectDB();

        console.log("\n=================================");
        console.log("NEXUS 9I - CREATE ADMIN ACCOUNTS");
        console.log("=================================\n");

        for (const admin of admins) {

            console.log(`Admin: ${admin.name}`);
            console.log(`User ID: ${admin.userId}`);

            const password = await ask(
                "Enter password for this admin: "
            );

            if (!password) {
                console.log("Password cannot be empty.\n");
                continue;
            }

            const existingAdmin = await Admin.findOne({
                userId: admin.userId
            });

            if (existingAdmin) {
                console.log(
                    "Account already exists. Skipping.\n"
                );
                continue;
            }

            const passwordHash = await bcrypt.hash(
                password,
                12
            );

            await Admin.create({
                userId: admin.userId,
                name: admin.name,
                passwordHash
            });

            console.log("Admin created successfully ✅\n");
        }

        console.log("=================================");
        console.log("Admin setup complete.");
        console.log("=================================\n");

    } catch (error) {

        console.error(
            "\nFailed to create admins ❌"
        );

        console.error(error.message);

    } finally {

        rl.close();

        await mongoose.connection.close();

        process.exit(0);
    }
}

main();