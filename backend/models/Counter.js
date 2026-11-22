
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  sequenceValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
