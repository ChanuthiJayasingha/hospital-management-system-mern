
require("dotenv").config();

const dns = require("node:dns");
const mongoose = require("mongoose");

dns.setServers(["1.1.1.1"]);

async function checkPatientDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hospital_management"
    });

    console.log("MongoDB connected successfully");

    const db = mongoose.connection.db;

    // Inspect existing patient numbers.
    const patients = await db
      .collection("patients")
      .find(
        {},
        { projection: { _id: 0, patientNumber: 1 } }
      )
      .toArray();

    console.log("\nExisting patient numbers:");

    console.log(
      patients.map((patient) => patient.patientNumber)
    );

    // Find the highest numeric PAT- identifier.
    const numericNumbers = patients
      .map((patient) => patient.patientNumber)
      .filter((number) => /^PAT-\d+$/.test(number))
      .map((number) => Number(number.slice(4)));

    const highestNumber =
      numericNumbers.length > 0
        ? Math.max(...numericNumbers)
        : 0;

    console.log(
      "\nHighest numeric patient sequence:",
      highestNumber
    );

    // Inspect the current counter without incrementing it.
    const counter = await db
      .collection("counters")
      .findOne({ name: "patientNumber" });

    console.log(
      "Current counter value:",
      counter ? counter.sequenceValue : "Not created"
    );

    // Check the database indexes.
    const patientIndexes = await db
      .collection("patients")
      .listIndexes()
      .toArray();

    const counterIndexes = await db
      .collection("counters")
      .listIndexes()
      .toArray();

    function hasUniqueIndex(indexes, field) {
      return indexes.some(
        (index) =>
          index.unique === true &&
          Object.keys(index.key).length === 1 &&
          index.key[field] === 1
      );
    }

    console.log(
      "\nPatient number unique index:",
      hasUniqueIndex(patientIndexes, "patientNumber")
        ? "FOUND"
        : "MISSING"
    );

    console.log(
      "Counter name unique index:",
      hasUniqueIndex(counterIndexes, "name")
        ? "FOUND"
        : "MISSING"
    );

    console.log("\nDatabase inspection completed.");

  } catch (error) {
    console.error(
      "Database inspection failed:",
      error.message
    );

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
}

checkPatientDatabase();
