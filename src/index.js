const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
const route = require("./routes");

require("dotenv").config();

const path = require("path");

// Connect to MongoDB
connectDB();

// Enable CORS
app.use(cors());

// phục vụ các tệp tin tĩnh từ thư mục tài nguyên
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    "HTTP Method: " +
      req.method +
      ", URL - " +
      req.url +
      ", Status: " +
      res.statusCode
  );
  next();
});

route(app);

app.get("/", function (req, res) {
  res.send("Xin chào Đỗ Hải Dương!");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
