import React from "react";
import WaitingTokenCard from "./WaitingTokenCard";
import PendingArrivalCard from "./PendingArrivalCard";

export default function QueueSection({
  q,
  counts,
  waitingTokens,
  pendingArrivals,
  timerNow,
  CALL_TIMEOUT_SECONDS,
  handleCallNext,
  updateArrivalStatus,
}) {
  const currentWaiting = waitingTokens.filter((t) => {
    const qType = (t.queue_type || t.queueType || "").toUpperCase();
    return qType === q.key;
  });

  const currentPending = pendingArrivals.filter((t) => {
    const qType = (t.queue_type || t.queueType || "").toUpperCase();
    return qType === q.key;
  });

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Queue Header & Call Next Button */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs">
            {q.key}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{q.name}</h2>
            <p className="text-xs text-slate-400">Manage queue tokens</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 px-3 bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Waiting</span>
            <strong className="text-lg font-black">{counts[q.key]}</strong>
          </div>

          <button
            onClick={() => handleCallNext(q.key)}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
          >
            CALL NEXT 📢
          </button>
        </div>
      </div>

      {/* Waiting Tokens Grid */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
            Next in Line
          </span>
          <small className="text-[10px] text-slate-400">
            {currentWaiting.length} Remaining
          </small>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {currentWaiting.map((token) => (
            <WaitingTokenCard key={token.id} token={token} />
          ))}

          {currentWaiting.length === 0 && (
            <div className="col-span-full text-xs text-slate-400 italic py-2">No tokens waiting</div>
          )}
        </div>
      </div>

      {/* Pending Arrivals Section */}
      <div className="p-4">
        <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-3">
          Currently Called / Pending Arrival
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentPending.map((token) => (
            <PendingArrivalCard
              key={token.id}
              token={token}
              timerNow={timerNow}
              callTimeoutSeconds={CALL_TIMEOUT_SECONDS}
              updateArrivalStatus={updateArrivalStatus}
            />
          ))}

          {currentPending.length === 0 && (
            <div className="col-span-full p-4 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
              No tokens called yet for this queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}