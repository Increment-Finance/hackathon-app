import React, { useState, useEffect } from "react";
import "./IFSlider.scss";

export default function IFSlider({
  min,
  max,
  defaultValue = "",
  onSlide,
  isLong
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    onSlide(value);
  });

  return (
    <div className="slidecontainer">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={event => {
          setValue(event.target.value);
        }}
        className={isLong ? "green-slider" : "red-slider"}
        id="myRange"
      />
    </div>
  );
}
