
require("dotenv").config();

const dns = require("node:dns");
const mongoose = require("mongoose");

const findPossibleDuplicates = require("../utils/findPossibleDuplicates");

dns.setServers(["1.1.1.1"]);

async function testDuplicateDetection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hospital_management"
    });

    console.log("MongoDB connected successfully");

    const matches = await findPossibleDuplicates(
      "Kamal Silva",
      "1995-08-20"
    );

    console.log("Matching patients:", matches.length);

    for (const patient of matches) {
      console.log(
        "Patient found:",
        patient.patientNumber,
        "-",
        patient.fullName
      );
    }

    const expectedPatient = matches.find(
      (patient) => patient.patientNumber === "PAT-000003"
    );

    if (!expectedPatient) {
      throw new Error("Expected patient PAT-000003 was not found");
    }

    console.log("TEST PASSED: Existing patient detected");

  } catch (error) {
    console.error("TEST FAILED:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

testDuplicateDetection();
