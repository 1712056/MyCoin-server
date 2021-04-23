import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import Auth from './routes/auth.route.js';
import User from './routes/user.route.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', Auth);
app.use('/api/users', User);
app.get("/err", function (req, res) {
  throw new Error("Error!");
});

app.use(function (req, res, next) {
  res.status(404).json({
    error_message: "Endpoint not found",
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error_message: "Something broke!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on port", `${PORT}`);
});