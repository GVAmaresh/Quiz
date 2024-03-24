import React, { useEffect } from "react";
import "./question.css";
function QuestionAnswer() {
  useEffect(() => {
    const choiceTextElements = document.querySelectorAll(".choice-text");
    const clickHandler = (e) => {

      choiceTextElements.forEach((element) => {
        element.style.marginLeft = "0";
        element.style.marginRight = "0";
        element.style.backgroundColor = "";
        if(element.dataset.isanswer === 'true'){
          element.style.marginLeft = "3vh";
          element.style.marginRight = "-3vh";
          element.style.backgroundColor = "black"; 
        }
        element.removeEventListener("click", clickHandler);
      });


      if (e.target.dataset.isanswer === "true") {
        e.target.style.marginLeft = "3vh";
        e.target.style.marginRight = "-3vh";
        e.target.style.backgroundColor = "black";
      } else {
        e.target.style.marginLeft = "3vh";
        e.target.style.marginRight = "-3vh";
        e.target.style.backgroundColor = "#FF0000"; 
      }
    };

    choiceTextElements.forEach((element) => {
      element.addEventListener("click", clickHandler);
    });
  }, []);
  return (
    <div className="question">
      <div className="question-text">
        How to pass a data into a child Component
      </div>
      <div className="choice">
        <div className="choice-text" data-isanswer={false}>
          State
        </div>
        <div className="choice-text" data-isanswer={true}>
          Props
        </div>
        <div className="choice-text" data-isanswer={false}>
          PropType
        </div>
        <div className="choice-text" data-isanswer={false}>
          Parameters
        </div>
      </div>
    </div>
  );
}

export default QuestionAnswer;
