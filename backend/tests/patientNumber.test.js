
require("dotenv").config();

const dns = require("node:dns");
const mongoose = require("mongoose");
const Counter = require("../models/Counter");
const generatePatientNumber = require("../utils/generatePatientNumber");

dns.setServers(["1.1.1.1"]);

async function testPatientNumberGeneration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hospital_management"
    });

    console.log("MongoDB connected successfully");

    // Make sure the counter's unique index is ready
    await Counter.init();

    // Generate two patient numbers
    const firstNumber = await generatePatientNumber();
    const secondNumber = await generatePatientNumber();

    console.log("First patient number:", firstNumber);
    console.log("Second patient number:", secondNumber);

    // Check the expected format
    const format = /^PAT-\d{6,}$/;

    if (!format.test(firstNumber) || !format.test(secondNumber)) {
      throw new Error("Patient number format is incorrect");
    }

    // Check that the second number follows the first
    const firstValue = Number(firstNumber.slice(4));
    const secondValue = Number(secondNumber.slice(4));

    if (secondValue !== firstValue + 1) {
      throw new Error("Patient numbers are not sequential");
    }

    console.log("TEST PASSED: Sequential patient numbers generated");

  } catch (error) {
    console.error("TEST FAILED:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

testPatientNumberGeneration();
