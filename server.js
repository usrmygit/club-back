require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorMiddleware");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const paymentRoute = require("./routes/paymentRoute");
const transactionRoute = require("./routes/transactionRoute");

const app = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

app.use(
  cors({
    origin: ["https://club-r7l8.onrender.com", "https://echelonsclub.top"],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/", async (req, res) => {
  res.send("");
});

app.use("/users", userRoute);
app.use("/payment", paymentRoute);
app.use("/transaction", transactionRoute);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
  })
  .catch((err) => console.log(err));
