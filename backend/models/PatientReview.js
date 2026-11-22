
const mongoose = require("mongoose");

const patientReviewSchema = new mongoose.Schema(
  {
    candidatePatient: {
      fullName: {
        type: String,
        required: true,
        trim: true
      },

      dateOfBirth: {
        type: Date,
        required: true
      },

      phone: {
        type: String,
        trim: true
      }
    },

    possibleMatchIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
      }
    ],

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED_DUPLICATE",
        "CLEARED"
      ],
      default: "PENDING",
      required: true
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);


patientReviewSchema.index(
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
    name: "unique_pending_patient_review"
  }
);


const PatientReview = mongoose.model(
  "PatientReview",
  patientReviewSchema
);

module.exports = PatientReview;
