const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const morgan = require("morgan");
const dotenv = require("dotenv");
const http = require("http");
const socket = require("socket.io");
const port = process.env.PORT || 7000;

// This should already be declared in your API file
var app = express();

// ADD THIS
var cors = require('cors');
app.use(cors());

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})

const io = socket(server,{
  cors: {
      origin: "http://localhost:7000",
      credentials: true,
  },
});
//* BorderParser Middleware
app.use(express.json());

//* Load Env
dotenv.config({ path: "./config.env" });

//* Connect DB
const db = config.get("mongoURI");
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Mongodb is connected..."))
  .catch((err) => console.log(err));

//* Log route actions
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//* Use Routes
//* Auth Routes *//
app.use("/api/users", require("./routes/users"));
app.use("/api/login", require("./routes/login"));
app.use("/api/login", require("./routes/login"));
app.use("/api/login/forgot_password", require("./routes/login"));
app.use("/api/login/reset_password", require("./routes/login"));

/** Chatroom routes */
require("./middleware/socket")(io);



// server.listen(port, () => console.log(`Server started on port ${port}`));
