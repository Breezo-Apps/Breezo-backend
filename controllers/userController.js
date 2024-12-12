const db = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userController = {
  register,
  login,
};

async function register(request, h) {
  try {
    const { username, password } = request.payload;

    const checkQuery = "SELECT * FROM users WHERE username = ?";
    const dataExists = await new Promise((resolve, reject) => {
      db.execute(checkQuery, [username], (err, results) => {
        if (err) {
          reject(new Error("Database query failed during data check."));
        } else {
          resolve(results.length > 0);
        }
      });
    });

    if (dataExists) {
      return h.response({ message: "Username already exists" }).code(400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery =
      "INSERT INTO users (id, username, password) VALUES (UUID(), ?, ?)";
    await new Promise((resolve, reject) => {
      db.execute(insertQuery, [username, hashedPassword], (err, results) => {
        if (err) {
          reject(new Error("Database query failed during user registration."));
        } else {
          resolve(results);
        }
      });
    });

    const data = {
      username: username,
      password: password,
    };

    return h
      .response({
        status: {
          code: 200,
          message: "User registered successfully",
        },
        data: data,
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: {
          code: 500,
          message: error.message,
        },
      })
      .code(500);
  }
}

async function login(request, h) {
  try {
    const { username, password } = request.payload;

    const user = await new Promise((resolve, reject) => {
      db.execute(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, results) => {
          if (err) {
            reject(new Error("Database query failed during user login."));
          } else {
            resolve(results[0]);
          }
        }
      );
    });

    if (!user) {
      return h
        .response({
          status: {
            code: 401,
            message: "Invalid username",
          },
        })
        .code(401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);
    if (!isPasswordValid) {
      return h
        .response({
          status: {
            code: 401,
            message: "Invalid password",
          },
        })
        .code(401);
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return h
      .response({
        status: {
          code: 200,
          message: "Login Successful",
        },
        data: {
          username: username,
          token: token,
        },
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: {
          code: 500,
          message: error.message,
        },
      })
      .code(500);
  }
}

module.exports = userController;
