import React from "react";

const InputText = ({
  label,
  value,
  onChange,
  inputStyle = "",
  labelStyle = "",
  error,
  placeholder = "Enter text...",
}) => {
  return (
    <div className="flex flex-col w-full">
      <label className={`text-sm font-medium mb-1 ${labelStyle}`}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${inputStyle} ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputText;
