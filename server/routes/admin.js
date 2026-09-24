const express = require("express");
const bcrypt = require("bcrypt");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

const authenticateToken = require("../middleware/auth");

const router = express.Router();


// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

router.use(authenticateToken);

router.use((req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required."
        });
    }

    next();
});


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function cleanUserId(value) {
    return String(value || "")
        .trim()
        .toUpperCase();
}

function cleanName(value) {
    return String(value || "")
        .trim();
}

function cleanSubject(value) {
    return String(value || "")
        .trim();
}


// ============================================================
// CHECK WHETHER USER ID ALREADY EXISTS
// ============================================================

async function userIdExists(userId) {

    const cleanId = cleanUserId(userId);

    const [
        student,
        teacher,
        admin
    ] = await Promise.all([

        Student.findOne({
            userId: cleanId
        }),

        Teacher.findOne({
            userId: cleanId
        }),

        Admin.findOne({
            userId: cleanId
        })
    ]);

    return Boolean(
        student ||
        teacher ||
        admin
    );
}


// ============================================================
// GET ALL USERS
//
// GET /api/admin/users
// ============================================================

router.get("/users", async (req, res) => {

    try {

        const [
            students,
            teachers,
            admins
        ] = await Promise.all([

            Student.find({})
                .select(
                    "_id userId name rollNo className createdAt"
                )
                .sort({
                    rollNo: 1
                }),

            Teacher.find({})
                .select(
                    "_id userId name subject createdAt"
                )
                .sort({
                    name: 1
                }),

            Admin.find({})
                .select(
                    "_id userId name createdAt"
                )
                .sort({
                    name: 1
                })
        ]);


        const users = [];


        // ----------------------------------------------------
        // STUDENTS
        // ----------------------------------------------------

        students.forEach(student => {

            users.push({

                id: student._id,

                userId: student.userId,

                name: student.name,

                role: "student",

                rollNo: student.rollNo,

                className: student.className,

                createdAt: student.createdAt
            });

        });


        // ----------------------------------------------------
        // TEACHERS
        // ----------------------------------------------------

        teachers.forEach(teacher => {

            users.push({

                id: teacher._id,

                userId: teacher.userId,

                name: teacher.name,

                role: "teacher",

                subject: teacher.subject,

                createdAt: teacher.createdAt
            });

        });


        // ----------------------------------------------------
        // ADMINS
        // ----------------------------------------------------

        admins.forEach(admin => {

            users.push({

                id: admin._id,

                userId: admin.userId,

                name: admin.name,

                role: "admin",

                createdAt: admin.createdAt
            });

        });


        res.json({

            success: true,

            users

        });

    } catch (error) {

        console.error(
            "Get users error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load users."

        });
    }

});


// ============================================================
// ADD USER
//
// POST /api/admin/users
//
// Student:
// {
//   role: "student",
//   userId: "S09IUK1",
//   name: "Utsav",
//   password: "1234",
//   rollNo: 1,
//   className: "9I"
// }
//
// Teacher:
// {
//   role: "teacher",
//   userId: "T09IPU",
//   name: "Physics Teacher",
//   password: "1234",
//   subject: "Physics"
// }
//
// Admin:
// {
//   role: "admin",
//   userId: "A09INT",
//   name: "Utsav",
//   password: "1234"
// }
// ============================================================

router.post("/users", async (req, res) => {

    try {

        const {
            role,
            userId,
            name,
            password,
            rollNo,
            className,
            subject
        } = req.body;


        // ----------------------------------------------------
        // BASIC VALIDATION
        // ----------------------------------------------------

        if (!role) {

            return res.status(400).json({

                success: false,

                message:
                    "User role is required."

            });

        }


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required."

            });

        }


        if (!name) {

            return res.status(400).json({

                success: false,

                message:
                    "Name is required."

            });

        }


        if (!password) {

            return res.status(400).json({

                success: false,

                message:
                    "Password is required."

            });

        }


        // ----------------------------------------------------
        // CLEAN VALUES
        // ----------------------------------------------------

        const cleanRole =
            String(role)
                .trim()
                .toLowerCase();

        const cleanId =
            cleanUserId(userId);

        const cleanUserName =
            cleanName(name);


        // ----------------------------------------------------
        // VALID ROLE
        // ----------------------------------------------------

        if (
            ![
                "student",
                "teacher",
                "admin"
            ].includes(cleanRole)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user role."

            });

        }


        // ----------------------------------------------------
        // USER ID VALIDATION
        // ----------------------------------------------------

        if (!cleanId) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID cannot be empty."

            });

        }


        // ----------------------------------------------------
        // NAME VALIDATION
        // ----------------------------------------------------

        if (!cleanUserName) {

            return res.status(400).json({

                success: false,

                message:
                    "Name cannot be empty."

            });

        }


        // ----------------------------------------------------
        // PASSWORD VALIDATION
        // ----------------------------------------------------

        if (
            typeof password !== "string" ||
            password.length < 4
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 4 characters."

            });

        }


        // ----------------------------------------------------
        // CHECK DUPLICATE USER ID
        // ----------------------------------------------------

        const exists =
            await userIdExists(cleanId);


        if (exists) {

            return res.status(409).json({

                success: false,

                message:
                    `User ID ${cleanId} already exists.`

            });

        }


        // ----------------------------------------------------
        // HASH PASSWORD
        // ----------------------------------------------------

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        // ====================================================
        // CREATE STUDENT
        // ====================================================

        if (cleanRole === "student") {

            const numericRollNo =
                Number(rollNo);


            // Roll number required

            if (
                !Number.isInteger(numericRollNo) ||
                numericRollNo < 1
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "A valid student roll number is required."

                });

            }


            const finalClass =
                cleanName(className) || "9I";


            // ------------------------------------------------
            // CHECK DUPLICATE ROLL NUMBER
            // ------------------------------------------------

            const existingRoll =
                await Student.findOne({

                    rollNo: numericRollNo,

                    className: finalClass

                });


            if (existingRoll) {

                return res.status(409).json({

                    success: false,

                    message:
                        `Roll number ${numericRollNo} already exists in ${finalClass}.`

                });

            }


            // ------------------------------------------------
            // CREATE
            // ------------------------------------------------

            const student =
                await Student.create({

                    userId: cleanId,

                    name: cleanUserName,

                    rollNo: numericRollNo,

                    className: finalClass,

                    passwordHash

                });


            return res.status(201).json({

                success: true,

                message:
                    "Student added successfully.",

                user: {

                    id: student._id,

                    userId: student.userId,

                    name: student.name,

                    role: "student",

                    rollNo: student.rollNo,

                    className: student.className

                }

            });

        }


        // ====================================================
        // CREATE TEACHER
        // ====================================================

        if (cleanRole === "teacher") {

            const cleanTeacherSubject =
                cleanSubject(subject);


            if (!cleanTeacherSubject) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Subject is required for a teacher."

                });

            }


            const teacher =
                await Teacher.create({

                    userId: cleanId,

                    name: cleanUserName,

                    subject:
                        cleanTeacherSubject,

                    passwordHash

                });


            return res.status(201).json({

                success: true,

                message:
                    "Teacher added successfully.",

                user: {

                    id: teacher._id,

                    userId: teacher.userId,

                    name: teacher.name,

                    role: "teacher",

                    subject:
                        teacher.subject

                }

            });

        }


        // ====================================================
        // CREATE ADMIN
        // ====================================================

        if (cleanRole === "admin") {

            const admin =
                await Admin.create({

                    userId: cleanId,

                    name: cleanUserName,

                    passwordHash

                });


            return res.status(201).json({

                success: true,

                message:
                    "Admin added successfully.",

                user: {

                    id: admin._id,

                    userId: admin.userId,

                    name: admin.name,

                    role: "admin"

                }

            });

        }


        // ----------------------------------------------------
        // SHOULD NEVER REACH HERE
        // ----------------------------------------------------

        return res.status(400).json({

            success: false,

            message:
                "Unable to create user."

        });


    } catch (error) {

        console.error(
            "Create user error:",
            error
        );


        // MongoDB duplicate key

        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message:
                    "This User ID already exists."

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to create user."

        });

    }

});


// ============================================================
// DELETE USER
//
// DELETE /api/admin/users/:role/:userId
// ============================================================

router.delete(
    "/users/:role/:userId",
    async (req, res) => {

        try {

            const role =
                String(
                    req.params.role || ""
                )
                .trim()
                .toLowerCase();


            const cleanId =
                cleanUserId(
                    req.params.userId
                );


            // ------------------------------------------------
            // VALIDATE ROLE
            // ------------------------------------------------

            if (
                ![
                    "student",
                    "teacher",
                    "admin"
                ].includes(role)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user role."

                });

            }


            // ------------------------------------------------
            // VALIDATE USER ID
            // ------------------------------------------------

            if (!cleanId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid User ID."

                });

            }


            // ------------------------------------------------
            // PREVENT SELF-DELETION
            // ------------------------------------------------

            if (
                req.user.userId === cleanId
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "You cannot delete your own admin account."

                });

            }


            // ------------------------------------------------
            // SELECT MODEL
            // ------------------------------------------------

            let UserModel;


            if (role === "student") {

                UserModel = Student;

            } else if (role === "teacher") {

                UserModel = Teacher;

            } else {

                UserModel = Admin;

            }


            // ------------------------------------------------
            // FIND USER
            // ------------------------------------------------

            const user =
                await UserModel.findOne({

                    userId: cleanId

                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }


            // ------------------------------------------------
            // PREVENT DELETING LAST ADMIN
            // ------------------------------------------------

            if (role === "admin") {

                const adminCount =
                    await Admin.countDocuments();


                if (adminCount <= 1) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "The last admin account cannot be deleted."

                    });

                }

            }


            // ------------------------------------------------
            // DELETE
            // ------------------------------------------------

            await UserModel.deleteOne({

                userId: cleanId

            });


            res.json({

                success: true,

                message:
                    `${role} ${cleanId} deleted successfully.`

            });


        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to delete user."

            });

        }

    }
);


// ============================================================
// ADMIN API STATUS
//
// GET /api/admin
// ============================================================

router.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Nexus 9I Admin API is running.",

        routes: {

            users:
                "GET /api/admin/users",

            addUser:
                "POST /api/admin/users",

            deleteUser:
                "DELETE /api/admin/users/:role/:userId"

        }

    });

});


// ============================================================
// EXPORT
// ============================================================

module.exports = router;