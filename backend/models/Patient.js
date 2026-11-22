
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    
dateOfBirth: {
  type: Date,
  required: true,
  validate: {
    validator: function (value) {
      return value instanceof Date &&
        !Number.isNaN(value.getTime()) &&
        value.getTime() <= Date.now();
    },
    message: "Date of birth cannot be in the future"
  }
},


    sex: {
      type: String,
      enum: ["Male", "Female", "Not specified"],
      default: "Not specified"
    },

    
phone: {
  type: String,
  trim: true,
  validate: {
    validator: function (value) {
      // Phone number is optional.
      if (value === undefined || value === null || value === "") {
        return true;
      }

      // Accept Sri Lankan mobile number formats:
      // 0771234567 or +94771234567
      return /^(?:07\d{8}|\+947\d{8})$/.test(value);
    },
    message: "Enter a valid Sri Lankan mobile number"
  }
},


    address: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

const Patient = mongoose.model(
  "Patient",
  patientSchema
);

module.exports = Patient;
