
const assert = require("node:assert/strict");
const Patient = require("../models/Patient");

function createTestPatient(changes = {}) {
  return new Patient({
    patientNumber: "PAT-REGRESSION-TEST",
    fullName: "Test Patient",
    dateOfBirth: "1995-08-20",
    sex: "Male",
    phone: "0771234567",
    ...changes
  });
}

function runTest(name, changes, expectedErrorField = null) {
  const patient = createTestPatient(changes);
  const error = patient.validateSync();

  if (expectedErrorField === null) {
    assert.equal(error, undefined);
  } else {
    assert.ok(
      error?.errors[expectedErrorField],
      `Expected validation error for ${expectedErrorField}`
    );
  }

  console.log(`${name}: PASSED`);
}

try {
  runTest("Test 1 - Valid patient", {});

  runTest(
    "Test 2 - Missing name",
    { fullName: undefined },
    "fullName"
  );

  runTest(
    "Test 3 - Blank name",
    { fullName: "   " },
    "fullName"
  );

  runTest(
    "Test 4 - Future date of birth",
    { dateOfBirth: "2030-05-12" },
    "dateOfBirth"
  );

  runTest(
    "Test 5 - Invalid phone",
    { phone: "abc123" },
    "phone"
  );

  console.log("\nALL PATIENT VALIDATION TESTS PASSED");

} catch (error) {
  console.error("TEST FAILED:", error.message);
  process.exitCode = 1;
}
