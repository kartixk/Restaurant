require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/sweet-shop")
  .then(() => {
    app.listen(4000, () => {
      console.log("🚀 Server running at http://localhost:4000");
    });
  });
