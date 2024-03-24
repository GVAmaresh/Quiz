import React from "react";
import "./start.css";

function Start({ change }) {
  return (
    <div className="start">
      <div className="participant">
        Enter the Unique Code for Quiz Participation
      </div>
      <div className="code">
        <input type="text" name="" id="enterCode" />
        <div className="button" onClick={() => change(false)}>
          Submit
        </div>
      </div>
      <div className="change" onClick={() => change(true)}>
        Wanna create a quiz?
      </div>
    </div>
  );
}

export default Start;
