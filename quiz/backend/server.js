const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(cors());

process.on("uncaughtException", (err) => {
  console.log(err);
  //   server.close(() => process.exit(1));
});

mongoose
  .createConnection(
    "mongodb+srv://Saitama:2008hebbar@quiz.mqrrpvy.mongodb.net/",
    {
      useNewUrlParser: true,
    }
  )
  .on("error", (err) => console.log(`Database Error ${err}`))
  .on("connected", () => console.log("Database connected"));

const server = app.listen(5000, () =>
  console.log("Connected to the port 5000")
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
//   console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
