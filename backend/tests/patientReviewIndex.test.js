
require("dotenv").config();

const dns = require("node:dns");
const mongoose = require("mongoose");

dns.setServers(["1.1.1.1"]);

async function checkAndCreateIndex() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hospital_management",
      autoIndex: false
    });

    console.log("MongoDB connected successfully");

    const collection = mongoose.connection.db.collection(
      "patientreviews"
    );

    // Check existing indexes.
    const indexes = await collection.listIndexes().toArray();

    const indexName = "unique_pending_patient_review";

    const existingIndex = indexes.find(
      (index) => index.name === indexName
    );

    if (existingIndex) {
      const valid =
        existingIndex.unique === true &&
        existingIndex.key["candidatePatient.fullName"] === 1 &&
        existingIndex.key["candidatePatient.dateOfBirth"] === 1 &&
        Object.keys(existingIndex.key).length === 2 &&
        existingIndex.partialFilterExpression?.status === "PENDING" &&
        existingIndex.collation?.locale === "en" &&
        existingIndex.collation?.strength === 2;

      if (!valid) {
        throw new Error(
          "An index with this name exists but has different settings"
        );
      }

      console.log("Unique index already exists with expected settings");

    } else {
      // Check for conflicting pending reviews first.
      const duplicates = await collection.aggregate(
        [
          { $match: { status: "PENDING" } },
          {
            $group: {
              _id: {
                name: "$candidatePatient.fullName",
                dateOfBirth: "$candidatePatient.dateOfBirth"
              },
              count: { $sum: 1 }
            }
          },
          { $match: { count: { $gt: 1 } } },
          { $limit: 1 }
        ],
        {
          collation: {
            locale: "en",
            strength: 2
          }
        }
      ).toArray();

      if (duplicates.length > 0) {
        throw new Error(
          "Conflicting pending reviews found. Index not created."
        );
      }

      console.log("No conflicting pending reviews found");

      // Create the unique index.
      await collection.createIndex(
        {
          "candidatePatient.fullName": 1,
          "candidatePatient.dateOfBirth": 1
        },
        {
          unique: true,
          partialFilterExpression: {
            status: "PENDING"
          },
          collation: {
            locale: "en",
            strength: 2
          },
          name: indexName
        }
      );

      console.log("Unique index created successfully");
    }

    // Independently verify the database index.
    const verifiedIndexes =
      await collection.listIndexes().toArray();

    const verified = verifiedIndexes.some(
      (index) =>
        index.name === indexName &&
        index.unique === true &&
        index.key["candidatePatient.fullName"] === 1 &&
        index.key["candidatePatient.dateOfBirth"] === 1 &&
        Object.keys(index.key).length === 2 &&
        index.partialFilterExpression?.status === "PENDING" &&
        index.collation?.locale === "en" &&
        index.collation?.strength === 2
    );

    if (!verified) {
      throw new Error("Unique index verification failed");
    }

    console.log("TEST PASSED: Pending-review unique index verified");

  } catch (error) {
    console.error("TEST FAILED:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
}

checkAndCreateIndex();
