
const Counter = require("../models/Counter");

async function generatePatientNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: "patientNumber" },
    { $inc: { sequenceValue: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  const number = String(counter.sequenceValue).padStart(6, "0");

  return `PAT-${number}`;
}

module.exports = generatePatientNumber;
