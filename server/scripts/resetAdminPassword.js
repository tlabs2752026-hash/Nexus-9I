const readline = require("readline");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const Admin = require("../models/Admin");
const connectDB = require("../config/db");

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
        console.log("NEXUS 9I - RESET ADMIN PASSWORD");
        console.log("=================================\n");

        const userId = (
            await ask("Enter Admin User ID: ")
        ).toUpperCase();

        const admin = await Admin.findOne({ userId });

        if (!admin) {
            console.log("\nAdmin not found ❌");
            return;
        }

        console.log(`Admin: ${admin.name}`);

        const newPassword = await ask(
            "Enter NEW password: "
        );

        if (!newPassword) {
            console.log("\nPassword cannot be empty ❌");
            return;
        }

        if (newPassword.length < 8) {
            console.log(
                "\nPassword must be at least 8 characters ❌"
            );
            return;
        }

        const passwordHash = await bcrypt.hash(
            newPassword,
            12
        );

        await Admin.updateOne(
            { userId },
            {
                $set: {
                    passwordHash
                }
            }
        );

        console.log("\nPassword reset successfully ✅");

    } catch (error) {
        console.error("\nPassword reset failed ❌");
        console.error(error.message);

    } finally {
        rl.close();
        await mongoose.connection.close();
    }
}

main();