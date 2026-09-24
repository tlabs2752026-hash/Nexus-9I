const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");

const Exam = require("../models/Exam");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");

router.use(authenticateToken);

// ==========================================
// GET ALL EXAMS
// ==========================================

router.get("/", async (req, res) => {
    try {
        const exams = await Exam
            .find()
            .sort({ examDate: 1, examTime: 1 });

        res.json({
            success: true,
            exams
        });

    } catch (error) {
        console.error("Load exams error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load exams."
        });
    }
});

// ==========================================
// CREATE EXAM
// ==========================================

router.post("/", async (req, res) => {
    try {
        const {
            name,
            subject,
            examDate,
            examTime,
            maxMarks
        } = req.body;

        if (
            !name ||
            !subject ||
            !examDate ||
            !examTime ||
            maxMarks === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All exam fields are required."
            });
        }

        const role = String(req.user.role || "").toLowerCase();
        const userId = String(req.user.userId || "").toUpperCase();

        if (role !== "admin" && role !== "teacher") {
            return res.status(403).json({
                success: false,
                message: "Only admins and teachers can create exams."
            });
        }

        let author = null;

        if (role === "admin") {
            author = await Admin.findOne({ userId });
        } else {
            author = await Teacher.findOne({ userId });
        }

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Exam creator account not found."
            });
        }

        const exam = await Exam.create({
            name: name.trim(),
            subject: subject.trim(),
            examDate: examDate.trim(),
            examTime: examTime.trim(),
            maxMarks: Number(maxMarks),

            createdBy: author.userId,
            createdByName: author.name,
            createdByRole: role
        });

        res.status(201).json({
            success: true,
            message: "Exam created successfully.",
            exam
        });

    } catch (error) {
        console.error("Create exam error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to create exam."
        });
    }
});

// ==========================================
// DELETE EXAM
// ==========================================

router.delete("/:id", async (req, res) => {
    try {
        const role = String(req.user.role || "").toLowerCase();
        const userId = String(req.user.userId || "").toUpperCase();

        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found."
            });
        }

        // Admin can delete any exam
        if (role === "admin") {
            await Exam.findByIdAndDelete(req.params.id);

            return res.json({
                success: true,
                message: "Exam deleted successfully."
            });
        }

        // Teacher can delete only their own exam
        if (
            role === "teacher" &&
            exam.createdBy === userId
        ) {
            await Exam.findByIdAndDelete(req.params.id);

            return res.json({
                success: true,
                message: "Exam deleted successfully."
            });
        }

        return res.status(403).json({
            success: false,
            message: "You cannot delete this exam."
        });

    } catch (error) {
        console.error("Delete exam error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete exam."
        });
    }
});

module.exports = router;