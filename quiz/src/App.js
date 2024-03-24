import React, { useState } from "react";
import "./App.css";
import Button from "./Button/Button";
import ProgressBar from "./Progress/ProgressBar.js";
import QuestionAnswer from "./Question/QuestionAnswer";
import Start from "./Start/Start";
import QuizTime from "./QuizTime";

function App() {
  const [start, setStart] = useState(true);
  const [change, setChange] = useState(true);
  function handleStart() {
    setStart(true);
  }
  function changeState(event) {
    console.log(event);
    if (event) {
      setStart(!start);
    }
    setChange(false);
  }

  return (
    <div className="App">
      <div className="App-header">
        {change ? (
          <Start change={changeState} />
        ) : start ? (
          <>
            <QuizTime handleStart={handleStart} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default App;
