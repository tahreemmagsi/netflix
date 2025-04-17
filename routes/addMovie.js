const express = require("express");
const router = express.Router();
router.get("/fetch-movie", async (req, res) => {
  console.log("movie fetched");
});
module.exports = router;
