import React from "react";
import "./progressBar.css";
function ProgressBar() {
  return (
    <div className="progress">
      <div className="progressBar">
        <div className="progressBar1"></div>
        <div className="progressBar2"></div>
      </div>
      <div className="sub">
        <div className="subText">Questions 6/15</div>
        <div className="subText2">30/280</div>
      </div>
    </div>
  );
}

export default ProgressBar;
