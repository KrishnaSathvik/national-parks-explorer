// ✅ Enhanced Accordion.jsx UI
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  return (
    <div className="rounded-2xl border border-gray-200 mb-6 shadow transition-all duration-200 bg-white/80 backdrop-blur">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={toggleAccordion}
        className="flex justify-between items-center w-full px-5 py-4 bg-gray-50 hover:bg-gray-100 text-left rounded-t-2xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        <span className="text-gray-800 text-base font-semibold">{title}</span>
        <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } bg-white rounded-b-2xl`}
      >
        {isOpen && (
          <div className="px-5 py-4 text-sm text-gray-700 leading-relaxed">{children}</div>
        )}
      </div>
    </div>
  );
};

export default Accordion;