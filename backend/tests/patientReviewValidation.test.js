
const PatientReview = require("../models/PatientReview");

let allPassed = true;

function checkTest(name, condition) {
  const passed = Boolean(condition);

  console.log(`${name}: ${passed ? "PASSED" : "FAILED"}`);

  if (!passed) {
    allPassed = false;
  }
}

// Test 1: Valid review request
const validReview = new PatientReview({
  candidatePatient: {
    fullName: "Kamal Silva",
    dateOfBirth: new Date("1995-08-20"),
    phone: "0779999999"
  },
  status: "PENDING"
});

const validError = validReview.validateSync();

checkTest(
  "Test 1 - Valid review",
  !validError
);

// Test 2: Missing candidate name
const missingNameReview = new PatientReview({
  candidatePatient: {
    dateOfBirth: new Date("1995-08-20")
  }
});

const missingNameError = missingNameReview.validateSync();

checkTest(
  "Test 2 - Missing name rejected",
  Boolean(missingNameError?.errors["candidatePatient.fullName"])
);

// Test 3: Invalid review status
const invalidStatusReview = new PatientReview({
  candidatePatient: {
    fullName: "Kamal Silva",
    dateOfBirth: new Date("1995-08-20")
  },
  status: "APPROVED"
});

const invalidStatusError = invalidStatusReview.validateSync();

checkTest(
  "Test 3 - Invalid status rejected",
  Boolean(invalidStatusError?.errors.status)
);

// Test 4: Default status
const defaultStatusReview = new PatientReview({
  candidatePatient: {
    fullName: "Kamal Silva",
    dateOfBirth: new Date("1995-08-20")
  }
});

checkTest(
  "Test 4 - Default status is PENDING",
  defaultStatusReview.status === "PENDING" &&
    !defaultStatusReview.validateSync()
);

// Make the command fail if any test fails.
if (!allPassed) {
  process.exitCode = 1;
}

