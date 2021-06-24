import React, { useState, useEffect } from "react";
import "./IFSlider.scss";

export default function IFSlider({ min, max, defaultValue, onSlide, isLong }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    onSlide(value);
  });

  return (
    <div class="slidecontainer">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onInput={(event) => {
          setValue(event.target.value);
        }}
        class={isLong ? "green-slider" : "red-slider"}
        id="myRange"
      />
    </div>
  );
}
