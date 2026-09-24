const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        rollNo: {
            type: Number,
            required: true
        },

        className: {
            type: String,
            default: "9I",
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        photo: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Student", studentSchema);