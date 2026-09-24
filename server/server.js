// ============================================================
// NEXUS 9I - SERVER.JS
// ============================================================
// Backend: Node.js + Express
// Database: MongoDB
// AI: Gemini / Nexus AI
// ============================================================


// ============================================================
// DNS CONFIGURATION
// ============================================================
// Use public DNS servers for MongoDB Atlas SRV/replica-set
// hostname resolution.

const dns = require("dns");

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);


// ============================================================
// CORE MODULES
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");


// ============================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================

dotenv.config();


// ============================================================
// DATABASE
// ============================================================

const connectDB = require("./config/db");


// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const announcementRoutes = require("./routes/announcements");
const examRoutes = require("./routes/exams");
const aiRoutes = require("./routes/ai");


// ============================================================
// APP CONFIGURATION
// ============================================================

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_ROOT = path.resolve(__dirname, "..");


// ============================================================
// DATABASE CONNECTION
// ============================================================

connectDB();


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


// ============================================================
// STATIC FRONTEND FILES
// ============================================================

app.use(
    express.static(CLIENT_ROOT)
);


// ============================================================
// UPLOAD DIRECTORIES
// ============================================================

const uploadsPath = path.join(
    __dirname,
    "uploads"
);

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(
        uploadsPath,
        {
            recursive: true
        }
    );
}


const studentUploadsPath = path.join(
    uploadsPath,
    "students"
);

if (!fs.existsSync(studentUploadsPath)) {
    fs.mkdirSync(
        studentUploadsPath,
        {
            recursive: true
        }
    );
}


// ============================================================
// SERVE UPLOADED FILES
// ============================================================

app.use(
    "/uploads",
    express.static(uploadsPath)
);


// ============================================================
// API ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/announcements",
    announcementRoutes
);

app.use(
    "/api/exams",
    examRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);


// ============================================================
// FRONTEND ROUTES
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "index.html"
            )
        );

    }
);


app.get(
    "/login.html",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "login.html"
            )
        );

    }
);


app.get(
    "/student.html",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "student.html"
            )
        );

    }
);


app.get(
    "/teacher.html",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "teacher.html"
            )
        );

    }
);


app.get(
    "/admin.html",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "admin.html"
            )
        );

    }
);


// ============================================================
// IMAGE ROUTES
// ============================================================

app.get(
    "/logo.png",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "logo.png"
            )
        );

    }
);


app.get(
    "/group.jpeg",
    (req, res) => {

        res.sendFile(
            path.join(
                CLIENT_ROOT,
                "group.jpeg"
            )
        );

    }
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Nexus 9I server is running 🚀",

            services: {

                database: true,

                auth: true,

                admin: true,

                announcements: true,

                exams: true,

                nexusAI: true

            }

        });

    }
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Page or API route not found."

        });

    }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "================================="
        );

        console.error(
            "SERVER ERROR"
        );

        console.error(
            "================================="
        );

        console.error(err);

        console.error(
            "================================="
        );


        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                "Internal server error."

        });

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "           NEXUS 9I"
        );

        console.log(
            "================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Local: http://localhost:${PORT}`
        );

        console.log(
            `LAN: http://YOUR-PC-IP:${PORT}`
        );

        console.log("");

        console.log(
            "Frontend:"
        );

        console.log(
            "  /"
        );

        console.log(
            "  /login.html"
        );

        console.log(
            "  /student.html"
        );

        console.log(
            "  /teacher.html"
        );

        console.log(
            "  /admin.html"
        );

        console.log("");

        console.log(
            "API:"
        );

        console.log(
            "  /api/health"
        );

        console.log(
            "  /api/auth"
        );

        console.log(
            "  /api/admin"
        );

        console.log(
            "  /api/announcements"
        );

        console.log(
            "  /api/exams"
        );

        console.log(
            "  /api/ai"
        );

        console.log("");

        console.log(
            "Database: MongoDB"
        );

        console.log(
            "Nexus AI: Gemini"
        );

        console.log("");

        console.log(
            "================================="
        );

        console.log("");

    }
);