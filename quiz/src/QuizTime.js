import React, { useState } from "react";
import ProgressBar from "./Progress/ProgressBar";
import QuestionAnswer from "./Question/QuestionAnswer";
import Button from "./Button/Button";
import questionJson from './json/question.json'

function QuizTime({handleStart}) {
    const[question, setQuestion] = useState(questionJson)
  return (
    <>
      <ProgressBar />
      <QuestionAnswer/>
      <Button onClick={() => handleStart} />
    </>
  );
}

export default QuizTime;
