import React from "react";

export default function StaffHeader({ shopProfile, staffProfile, user, date, time, logout }) {
  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
          {shopProfile?.name || "Loading Shop..."}
        </h1>
        <p className="text-xs md:text-sm text-slate-500">
          Counter Staff: <strong className="text-slate-700">{staffProfile?.name || user?.name || "Staff"}</strong>
        </p>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
        <div className="flex flex-col items-start md:items-end text-xs text-slate-400">
          <span className="text-slate-600 font-semibold">{date} • {time}</span>
        </div>

        <button
          onClick={logout}
          className="h-10 px-5 border border-red-200 rounded-lg bg-white text-red-600 text-xs font-bold tracking-wide hover:bg-red-600 hover:text-white transition-colors duration-200 shadow-sm"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
}