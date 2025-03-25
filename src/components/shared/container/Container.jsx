import React from "react";

const Container = ({ children, className = "" }) => {
  return (
    <div
      className={`w-full bg-white shadow-lg py-6 px-10 rounded-xl ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
