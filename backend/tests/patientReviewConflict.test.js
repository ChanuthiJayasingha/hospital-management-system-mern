
const assert = require("node:assert/strict");
const express = require("express");
const mongoose = require("mongoose");

const PatientReview = require("../models/PatientReview");
const Patient = require("../models/Patient");

// Mock the duplicate-search function before loading the router.
const duplicatePath = require.resolve(
  "../utils/findPossibleDuplicates"
);

require(duplicatePath);

require.cache[duplicatePath].exports = async () => [
  { _id: new mongoose.Types.ObjectId() }
];

// Simulate two requests racing to create a review.
// The lookup sees no existing review.
PatientReview.findOne = () => ({
  collation: async () => null
});

// Simulate MongoDB rejecting the second insert.
PatientReview.create = async () => {
  const error = new Error(
    "E11000 duplicate key error index: unique_pending_patient_review"
  );

  error.code = 11000;
  throw error;
};

// Safety guard: this test must never save a patient.
Patient.prototype.save = async () => {
  throw new Error("Unexpected patient save attempted");
};

const patientRoutes = require("../routes/patientRoutes");

async function runTest() {
  const app = express();

  app.use(express.json());
  app.use("/api/patients", patientRoutes);

  const server = app.listen(0, "127.0.0.1");

  try {
    await new Promise((resolve) => {
      if (server.listening) return resolve();
      server.once("listening", resolve);
    });

    const port = server.address().port;

    const response = await fetch(
      `http://127.0.0.1:${port}/api/patients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: "Kamal Silva",
          dateOfBirth: "1995-08-20",
          sex: "Male"
        })
      }
    );

    const result = await response.json();

    console.log("HTTP Status:", response.status);
    console.log("Response code:", result.code);
    console.log("Requires review:", result.requiresReview);

    assert.equal(response.status, 409);
    assert.equal(result.code, "POSSIBLE_DUPLICATE");
    assert.equal(result.requiresReview, true);

    console.log(
      "TEST PASSED: Concurrent review conflict handled"
    );

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runTest().catch((error) => {
  console.error("TEST FAILED:", error.message);
  process.exitCode = 1;
});
