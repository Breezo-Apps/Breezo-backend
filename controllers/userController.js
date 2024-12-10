const db = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async(request, h) => {
    const { username, password } = request.payload;

    try {
        const [existingUser] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUser.length > 0) {
            return h.response({ message: "Username already exists" }).code(400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query("INSERT INTO users (id, username, password) VALUES (UUID(), ?, ?)", [username, hashedPassword]);

        return h.response({ message: "registered successful" }).code(201);
    } catch (error) {
        console.error("Error details:", error.message);
        return h.response({ message: "Internal Server Error" }).code(500);
    }
};

exports.login = async(request, h) => {
    const { username, password } = request.payload;

    try {
        const [user] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (user.length === 0) {
            return h.response({ message: "Invalid username or password" }).code(401);
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        if (!isPasswordValid) {
            return h.response({ message: "Invalid username or password" }).code(401);
        }

        const token = jwt.sign({ username: user[0].username }, SECRET_KEY, { expiresIn: "1h" });

        return h.response({ message: "Login successful", token }).code(200);
    } catch (error) {
        console.error(error);
        return h.response({ message: "Internal Server Error" }).code(500);
    }
};