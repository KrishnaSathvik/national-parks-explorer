import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-gray-200 mb-6 shadow-sm transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full px-5 py-4 font-medium text-left bg-gray-50 hover:bg-gray-100 rounded-t-2xl transition duration-200"
      >
        <span className="text-gray-800">{title}</span>
        <span className="text-gray-500">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>
      {isOpen && (
        <div className="px-5 py-4 text-sm text-gray-700 bg-white rounded-b-2xl">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
