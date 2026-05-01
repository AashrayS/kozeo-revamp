import React, { forwardRef } from "react";

type InputFieldProps = {
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  style?: React.CSSProperties;
  className?: string;
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ placeholder, value, onChange, type = "text", style, className }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`p-3 rounded-md border w-full ${className ?? ""}`}
        style={style}
      />
    );
  }
);

InputField.displayName = "InputField"; // Important to avoid warning

export default InputField;
