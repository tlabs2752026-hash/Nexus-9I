const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        authorId: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        authorName: {
            type: String,
            required: true,
            trim: true
        },

        authorRole: {
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
    "Announcement",
    announcementSchema
);