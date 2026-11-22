
const Patient = require("../models/Patient");

async function findPossibleDuplicates(fullName, dateOfBirth) {
  // Check that both values were provided.
  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    !dateOfBirth
  ) {
    throw new Error("Full name and date of birth are required");
  }

  // Convert the date into a JavaScript Date object.
  const date = new Date(dateOfBirth);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date of birth");
  }

  // Define the start and end of the UTC calendar day.
  const startOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    )
  );

  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  // Search for possible matching patients.
  const matches = await Patient.find({
    fullName: fullName.trim(),
    dateOfBirth: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  })
    .collation({ locale: "en", strength: 2 })
    .select("_id patientNumber fullName dateOfBirth")
    .limit(10)
    .lean();

  return matches;
}

module.exports = findPossibleDuplicates;
