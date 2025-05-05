import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-300 rounded-md mb-4">
      <button
        className="flex justify-between items-center w-full p-3 font-semibold bg-gray-100 hover:bg-gray-200 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isOpen && <div className="p-4 text-sm bg-white">{children}</div>}
    </div>
  );
};

export default Accordion;
