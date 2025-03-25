import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputPasswordField = ({
  label,
  value,
  onChange,
  inputStyle = "",
  labelStyle = "",
  error,
  placeholder = "Enter password...",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col w-full relative">
      <label className={`text-sm font-medium mb-1 ${labelStyle}`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`border w-full rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 ${inputStyle} ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputPasswordField;
