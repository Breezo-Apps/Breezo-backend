const userController = require("../controllers/userController");

const userRoutes = [
  {
    method: "POST",
    path: "/user/register",
    options: {
      payload: {
        parse: true,
        output: "data",
        allow: "application/json",
      },
    },
    handler: userController.register,
  },
  {
    method: "POST",
    path: "/user/login",
    options: {
      payload: {
        parse: true,
        output: "data",
        allow: "application/json",
      },
    },
    handler: userController.login,
  },
];

module.exports = userRoutes;
