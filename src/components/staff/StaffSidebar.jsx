import React from "react";

export default function StaffSidebar({ queuesList, selectedQueues, toggleQueue }) {
  return (
    <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-3 md:p-5 flex md:flex-col overflow-x-auto md:overflow-y-auto gap-2 md:gap-1 shrink-0">
      <div className="hidden md:block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase px-3 mb-2">
        Queues Filter
      </div>

      <button
        onClick={() => toggleQueue("ALL")}
        className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
          selectedQueues.includes("ALL") ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-slate-500" />
        <span>ALL</span>
      </button>

      {queuesList.map((q) => (
        <button
          key={q.key}
          onClick={() => toggleQueue(q.key)}
          className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
            selectedQueues.includes(q.key) ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className={`w-2 h-2 rounded-full bg-${q.color}-500`} />
          <span>{q.name}</span>
        </button>
      ))}
    </aside>
  );
}