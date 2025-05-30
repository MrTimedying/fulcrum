import React, { useState, useEffect, useRef } from "react";

// Inline edit component for editing text directly in place
export const InlineEdit = ({
  value,
  onSave,
  placeholder = "Edit me",
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => {
    setText(value || "");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (text !== value) {
      onSave(text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setText(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`p-1 rounded bg-zinc-800 border border-blue-500 text-white outline-none ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={handleEdit}
      className={`p-1 rounded hover:bg-zinc-700 cursor-pointer ${className} ${
        !value ? "text-zinc-400 italic" : ""
      }`}
      title="Click to edit"
    >
      {value || placeholder}
    </div>
  );
};

export default InlineEdit;
