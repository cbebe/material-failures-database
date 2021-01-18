const express = require("express");
import routes from "./routes";

const router = express.Router();

// Homepage API call, to get the object_id, mode
// and thumbnail of all items in database
router.get("/display", routes.display);

// Settings API call, to get the display and
// object tables
router.get("/settings", routes.settings);

// Settings API call, to post the toggled
// display setting
router.post("/settings", routes.toggle);

// Login API call, to check the users
// credentials
router.post("/login", routes.login);

// Record API call, to get all tables which are
// necessary to display a record
router.get("/record", routes.record);

// Case study API call, to get all tables which will
// have prompts shown
router.get("/visibility/prompt", routes.visibility.prompt);

// Case study API call, to get all tables which will
// have fields shown
router.get("/visibility/field", routes.visibility.field);

// Case study API call, to get all tables which are
// necessary to display a case study
router.get("/study", routes.study);

module.exports = router;
