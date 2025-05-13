// src/components/EventHeatmap.jsx
import React from "react";

const EventHeatmap = ({ selectedDate, setSelectedDate, monthlyEventMap }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const heatmapDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const iso = date.toLocaleDateString("en-CA");
    const count = monthlyEventMap[iso] || 0;
    let bg = count >= 10 ? "bg-red-400" : count >= 5 ? "bg-orange-300" : count > 0 ? "bg-yellow-200" : "bg-gray-100";
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const ring = isSelected ? "ring-2 ring-blue-500" : "";

    return (
      <div
        key={i}
        className={`p-2 rounded ${bg} ${ring} cursor-pointer`}
        onClick={() => setSelectedDate(date)}
      >
        <div className="font-semibold">{i + 1}</div>
        <div className="text-xs">{count} evt</div>
      </div>
    );
  });

  return (
    <div className="text-center">
      <h2 className="text-md font-bold mb-1">
        🔥 Events in {today.toLocaleString("default", { month: "long" })} {year}
      </h2>
      <div className="inline-block p-2 rounded border border-gray-300 shadow-sm bg-white">
        <div className="grid grid-cols-7 gap-1 text-center text-xs">{heatmapDays}</div>
      </div>
      <div className="flex gap-4 text-xs justify-center mt-2">
        <div className="flex items-center gap-1"><div className="w-4 h-4 bg-yellow-200"></div>1–4</div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 bg-orange-300"></div>5–9</div>
        <div className="flex items-center gap-1"><div className="w-4 h-4 bg-red-400"></div>10+</div>
      </div>
    </div>
  );
};

export default EventHeatmap;
