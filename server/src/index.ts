import Express, { ErrorRequestHandler } from "express";
import Path from "path";
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./router");

const port = process.env.PORT || 5000;
const app = Express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the static files from the React app
app.use(Express.static(Path.join(__dirname, "client/build")));

app.use("/api", router);

const errHandler: ErrorRequestHandler = (err, _2, res, _3) => {
  console.error(err.stack);
  res.status(500).send("Response 500: Server Error. Very Frustrating!");
};
app.use(errHandler);

app.use((_1, res, _3) => {
  res.status(404).send("Response 400: Page Not Found. Hmmmm...");
});

app.get("*", (_1, res) => {
  res.sendFile(Path.join(__dirname + "/client/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}...`);
});
