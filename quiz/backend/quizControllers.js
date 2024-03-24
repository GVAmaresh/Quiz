const express = require("express");
const router = express.Router();
const Quiz = require("./quizModel");

exports.createUser = async (req, res) => {
  try {
    const { email, password } = await req.body;
    const existingUser = await Quiz.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    const user = new Quiz({
      email,
      password,
    });

    await user.save();

    res.locals.user = user;

    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to create User: " + err.message,
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    if (!res.locals.user) {
      return res.status(400).json({
        status: "error",
        message: "You are not authorized to create a quiz",
      });
    }

    const { code, question } = await req.body;
    const existingQuiz = await Quiz.findOne({ "quiz.code": code });

    if (existingQuiz) {
      return res.status(400).json({
        status: "error",
        message: "Quiz already exists",
      });
    }

    const quiz = new Quiz({
      quiz: {
        code,
        questions: question,
      },
    });

    await quiz.save();

    res.status(201).json({
      status: "success",
      data: {
        quiz,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to create Quiz: " + err.message,
    });
  }
};

exports.updateQuizCheck = async (req, res) => {
  try {
    const { code, password } = await req.body;
    const existingQuiz = await Quiz.findOne({ "quiz.code": code });

    if (!existingQuiz) {
      return res.status(400).json({
        status: "error",
        message: "Quiz does not exist",
      });
    }

    if (existingQuiz.quiz.password !== password) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    res.locals.updateQuiz = true;

    return res.status(200).json({
      status: "success",
      data: {
        quiz: existingQuiz,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to check the quiz: " + err.message,
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    if (!res.locals.updateQuiz || !res.locals.user) {
      return res.status(400).json({
        status: "error",
        message: "You are not authorized to update this quiz",
      });
    }
    const { code, question } = await req.body;
    await Quiz.findOneAndUpdate(
      { "quiz.code": code },
      { "quiz.questions": question }
    );

    res.locals.updateQuiz = false;

    return res.status(200).json({
      status: "success",
      message: "Quiz updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create User",
      error: err.message,
    });
  }
};

exports.receiveQuiz = async (req, res) => {
  try {
    const { code } = await req.body;
    const existingQuiz = await Quiz.findOne({ quiz: { code } });
    if (!existingQuiz || existingQuiz.date < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Quiz does not exist",
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        quiz: existingQuiz,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch Data",
      error: err.message,
    });
  }
};

exports.showAnswer = async (req, res) => {
    try{
        const { code } = req.body;
        const existingQuiz = await Quiz.findOne({ quiz: { code } });
        if (!existingQuiz || existingQuiz.date < new Date()) {
          return res.state(400).json({
            status: "error",
            message: "Quiz does not exist or does not finish",
          });
        }
        return res.state(201).json({
          status: "success",
          data: {
            quiz: existingQuiz,
          },
        });
    }catch(err){
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Data",
            error: err.message,
        });
    }
};
module.exports = router;
