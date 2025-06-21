"use client";

import React from "react";

interface InputFieldProps {
  id?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  style = {},
  autoFocus = false,
  required = false,
}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-3 rounded-md border transform focus:outline-none focus:ring-0 transition-all duration-300 focus:-translate-y-1 focus:shadow-lg ${className}`}
      style={style}
      autoFocus={autoFocus}
      required={required}
    />
  );
};

export default InputField;
