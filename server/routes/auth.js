const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { userId, password, role } = req.body;

        // Check required fields
        if (!userId || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "User ID, password and role are required."
            });
        }

        const cleanUserId = userId.trim().toUpperCase();

        // Select collection based on role
        let UserModel;

        if (role === "student") {
            UserModel = Student;
        } else if (role === "teacher") {
            UserModel = Teacher;
        } else if (role === "admin") {
            UserModel = Admin;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid role."
            });
        }

        // Find account
        const user = await UserModel.findOne({
            userId: cleanUserId
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid User ID or password."
            });
        }

        // Check password
        const passwordCorrect = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid User ID or password."
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user._id.toString(),
                userId: user.userId,
                role: role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Response data
        const userData = {
            id: user._id,
            userId: user.userId,
            name: user.name,
            role: role
        };

        // Add student-specific data
        if (role === "student") {
            userData.rollNo = user.rollNo;
            userData.className = user.className;
            userData.photo = user.photo;
        }

        // Add teacher-specific data
        if (role === "teacher") {
            userData.subject = user.subject;
        }

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: userData
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

module.exports = router;