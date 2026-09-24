const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");

const Announcement = require("../models/Announcement");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");

router.use(authenticateToken);

// ==========================================
// GET ALL ANNOUNCEMENTS
// ==========================================

router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement
            .find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            announcements
        });

    } catch (error) {
        console.error("Load announcements error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load announcements."
        });
    }
});

// ==========================================
// CREATE ANNOUNCEMENT
// ==========================================

router.post("/", async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required."
            });
        }

        const role = String(req.user.role || "").toLowerCase();
        const userId = String(req.user.userId || "").toUpperCase();

        if (role !== "admin" && role !== "teacher") {
            return res.status(403).json({
                success: false,
                message: "Only admins and teachers can create announcements."
            });
        }

        let author = null;

        if (role === "admin") {
            author = await Admin.findOne({ userId });
        } else if (role === "teacher") {
            author = await Teacher.findOne({ userId });
        }

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author account not found."
            });
        }

        const announcement = await Announcement.create({
            title: title.trim(),
            message: message.trim(),

            authorId: author.userId,
            authorName: author.name,
            authorRole: role
        });

        res.status(201).json({
            success: true,
            message: "Announcement created successfully.",
            announcement
        });

    } catch (error) {
        console.error("Create announcement error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to create announcement."
        });
    }
});

// ==========================================
// DELETE ANNOUNCEMENT
// ==========================================

router.delete("/:id", async (req, res) => {
    try {
        const role = String(req.user.role || "").toLowerCase();
        const userId = String(req.user.userId || "").toUpperCase();

        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found."
            });
        }

        // Admin can delete any announcement
        if (role === "admin") {
            await Announcement.findByIdAndDelete(req.params.id);

            return res.json({
                success: true,
                message: "Announcement deleted successfully."
            });
        }

        // Teacher can delete only their own announcement
        if (
            role === "teacher" &&
            announcement.authorId === userId
        ) {
            await Announcement.findByIdAndDelete(req.params.id);

            return res.json({
                success: true,
                message: "Announcement deleted successfully."
            });
        }

        return res.status(403).json({
            success: false,
            message: "You cannot delete this announcement."
        });

    } catch (error) {
        console.error("Delete announcement error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete announcement."
        });
    }
});

module.exports = router;