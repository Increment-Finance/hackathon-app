import React from "react";
import "./Container.scss";

export default function Container({ title, children, className }) {
  return (
    <div className={`container ${className}`}>
      <h2 className="title">{title}</h2>
      {children}
    </div>
  );
}
