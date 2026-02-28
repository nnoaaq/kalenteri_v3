require("dotenv").config();
const express = require("express");
const Router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { convertBufferToText, getWorkDays } = require("../utils/calendarUtils");
const { updateGoogleCalendar } = require("../utils/googleCalendarUtils");
Router.post("/add", upload.single("file"), async (req, res) => {
  if (!req.file || !req.body.choosenCalendar)
    return res
      .status(400)
      .json({ errMessage: "PDF kadonnut / Valittu kalenteri kadonnut" });
  const rawData = await convertBufferToText(req.file.buffer); // Koko PDF tekstinä
  if (!rawData) return res.redirect(`/?error=pdfText`);
  const workDays = await getWorkDays(rawData);
  if (workDays.length === 0)
    return res
      .status(404)
      .json({ errMessage: "Tiedostosta ei löytynyt työpäiviä" });
  // Työpäivä löytynyt
  const addedWorkDays =
    (await updateGoogleCalendar(
      workDays,
      req.session.tokens,
      req.body.choosenCalendar,
    )) || [];
  res.json(addedWorkDays);
});

module.exports = Router;
