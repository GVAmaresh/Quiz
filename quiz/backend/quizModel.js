const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema({
  choice: {
    type: String,
    required: true,
  },
  answer: {
    type: Boolean,
    required: true,
  },
});

const questionSchema = new mongoose.Schema({
  sno: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  choices: [choiceSchema],
});

const quizQuestionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  date: {type: Date, required: true},
  questions: [questionSchema],
});

const attendSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const quizSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quiz: quizQuestionSchema,
  attended: [attendSchema],
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
