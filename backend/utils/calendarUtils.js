const { PDFParse } = require("pdf-parse");
async function convertBufferToText(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    const rawDataText = await parser.getText();
    if (!rawDataText)
      return { errMessage: "Virhe PDF-tiedoston muuttamisessa tekstiksi" };
    return rawDataText;
  } catch (error) {
    return { errMessage: error };
  }
}
function convertToISODate(date, time) {
  // date dd.mm.yyyy
  // time hh:mm
  const [day, month, year] = date.split(".").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const dateObject = new Date(Date.UTC(year, month - 1, day, hour, minute)); // UTC AIKA
  const UTCYear = dateObject.getUTCFullYear();
  const UTCMonth = dateObject.getUTCMonth();
  const UTCDate = dateObject.getUTCDate();
  const UTCHour = dateObject.getUTCHours();
  const UTCMinute = dateObject.getUTCMinutes();
  return `${UTCYear}-${UTCMonth}-${UTCDate}T${UTCHour}:${UTCMinute}`;
}
function getWorkDays(rawData) {
  const formattedWorkDays = [];
  // 12.12.2026 \tMIK-9
  // 1.1.2026 \tAEK-12
  // 11.1.2026 \tMEK-280
  const foundDates = [
    ...rawData.text.matchAll(
      /\d{1,2}\.\d{1,2}\.\d{4}\s.(?:\w{3}-\d{1,3}|[AM]\d{3}-\d{3})/g,
    ),
  ];
  const workDays = foundDates.map((currentFoundDate, currentIndex) => {
    // currentFoundDate[0] = esim 21.2.2026 \tMIK-10 >> päivämäärä + vuorotunniste
    // currentFoundDate.index >> osuman aloituskohta tekstistä
    const startPos = currentFoundDate.index; // Nykyisen osuman alku
    const endPos = foundDates[currentIndex + 1] // Seuraavan osuman alku
      ? foundDates[currentIndex + 1].index
      : rawData.text.indexOf("80:00");
    return {
      date: currentFoundDate[0].replace(/(\d{1,2}\.\d{1,2}\.\d{4}).*/, "$1"), // Pelkkä päivämäärä muodossa DD.MM.YYYY
      lines: rawData.text.slice(startPos, endPos),
    }; // Osuman alusta seuraavaan osumaan, tai 80:00 jos ei seuraavaa osumaa
  });
  for (let workDay of workDays) {
    const calendarFormat = {
      date: workDay.date,
      description: "",
      summary: "",
      start: {
        dateTime: "",
      },
      end: {
        dateTime: "",
      },
    };
    const foundTimes = [];
    for (let match of workDay.lines.matchAll(
      /(\d{2}:\d{2})\s-\s(\d{2}:\d{2})/g,
    )) {
      foundTimes.push(match[1]);
      foundTimes.push(match[2]);
    }
    // ["21:51","21:52","20:50"]
    foundTimes.sort((a, b) => {
      const [aHours, aMinutes] = a.slice(":");
      const [bHours, bMinutes] = b.slice(":");
      return aHours * 60 + aMinutes - bHours * 60 + bMinutes;
    });
    // ["20:50","21:51","21:52"]
    const workDayLines = [
      ...workDay.lines
        .matchAll(/\d{2}:\d{2}\s-\s\d{2}:\d{2}.*/g)
        .map((match) => {
          return match[0]
            .replace(
              /(.*)(.*Siirtymä matkustajana.*)/,
              "$1 Siirtymä julkisilla",
            )
            .replace(/(.*)(\d{3})(.*)/g, "$1 [Vuoro : $2] $3")
            .replaceAll("\t", "")
            .replace(/(Ptau)/, " $1")
            .replace(/Linja-ajoa (\d)/, "[Suunta : $1]")
            .replace(/(Siirtymä)(.*)/, " $1$2")
            .replace(/(Aloitusaika)/, " $1")
            .replace(/(Lopetusaika)/, " $1")
            .replace(/(Ruokatauko)/, " $1")
            .replace(/(.*)CAR.*/, " $1 Siirtyminen pikku-autolla")
            .replace(/(Auto )(\w{9}).*/, " [$1$2]");
        }),
    ];
    const foundLines = [];
    for (let workDayLine of workDayLines) {
      // Yksittäinen rivi
      const workDayFoundLines = [
        ...workDayLine
          .matchAll(/(?<!:|\[.*|d)[345679]\d{1,2}?[ANVBK]?(?!\d)/g)
          .map((m) => {
            return m[0];
          }),
      ];
      if (workDayFoundLines.length !== 0) {
        workDayFoundLines.map((item) => foundLines.push(item));
      }
    }
    calendarFormat.summary = [...new Set(foundLines)].join(" | ");
    calendarFormat.description = workDayLines.join("\n\n");
    calendarFormat.start.dateTime = convertToISODate(
      workDay.date,
      foundTimes[0],
    );
    calendarFormat.end.dateTime = convertToISODate(
      workDay.date,
      foundTimes[foundTimes.length - 1],
    );
    formattedWorkDays.push(calendarFormat);
  }
  return formattedWorkDays;
}

module.exports = { convertBufferToText, getWorkDays };
