const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.set("view engine", "hbs");

const port = 5000;
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://tahreemfatima663:sSQXn9C5FAfOyyGO@cluster0.545qdlw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    tls: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Mongodb connection error:"));
db.once("open", () => {
  console.log("connected to mongodb");
});
const User = require("./models/users");
const session = require("express-session");
const MongoStore = require("connect-mongo");
app.use(
  session({
    secret: "1234abcd",

    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl:
        "mongodb+srv://tahreemfatima663:sSQXn9C5FAfOyyGO@cluster0.545qdlw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(cors());
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const dashboard = require("./routes/dashboard");
const addMovie = require("./routes/addMovie");

app.use("/", dashboard);
app.use("/", authRoutes);
app.use("/", addMovie);

app.listen(port, () => {
  console.log(`api is running on the port ${port}`);
});
