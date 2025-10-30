// app.js
const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const jobsRouter = require("./routes/jobs");

const app = express();

// 中间件
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 路由
app.use("/", indexRouter);
app.use("/v1", jobsRouter); // => /v1/health, /v1/jobs, /v1/jobs/:id

// 404
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理（返回 JSON）
app.use(function (err, req, res) {
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    message: err.message || "Internal Server Error",
    status,
  });
});

module.exports = app;
