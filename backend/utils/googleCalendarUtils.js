require("dotenv").config();
const { google } = require("googleapis");
const { createAuthClient } = require("../utils/authUtils");
async function updateGoogleCalendar(workDays, tokens, calendarId) {
  const addedWorkDays = [];
  const authClient = await createAuthClient();
  authClient.setCredentials(tokens);
  const calendar = google.calendar({ version: "v3", auth: authClient });
  const calendarIds = {
    mari: process.env.CALENDAR_ID_MARI,
    noa: process.env.CALENDAR_ID_NOA,
  };
  for (let workDay of workDays) {
    const addedWorkDay = await calendar.events.insert({
      calendarId: calendarIds[calendarId],
      resource: workDay,
    });
    addedWorkDays.push({
      date: addedWorkDay.data.start.dateTime.slice(0, 10),
      lines: addedWorkDay.data.summary,
    });
  }
  return addedWorkDays;
}
module.exports = { updateGoogleCalendar };
