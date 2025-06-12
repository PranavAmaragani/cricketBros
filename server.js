const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routers/auth.js");
const { profileRouter } = require("./routers/profile.js");
const { requestRouter } = require("./routers/requests.js");
const { userRouter } = require("./routers/user.js");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);




app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.send("hello");
});

//connecting to Database
connectDB()
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(8888, () => {
      console.log("App is listening");
    });
  })
  .catch((err) => {
    console.log("ERROR" + err.message);
  });
