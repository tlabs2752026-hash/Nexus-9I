const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        examDate: {
            type: String,
            required: true,
            trim: true
        },

        examTime: {
            type: String,
            required: true,
            trim: true
        },

        maxMarks: {
            type: Number,
            required: true,
            min: 1
        },

        createdBy: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        createdByName: {
            type: String,
            required: true,
            trim: true
        },

        createdByRole: {
            type: String,
            required: true,
            enum: ["admin", "teacher"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Exam",
    examSchema
);