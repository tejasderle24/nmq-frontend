import React from "react";

export default function PendingArrivalCard({ token, timerNow, callTimeoutSeconds, updateArrivalStatus }) {
  const status = String(token.status || "").toLowerCase();
  const isImHere = status === "imhere" || status === "im-here";
  const isCalled = status === "called";
  const customerConfirmed = token.customerConfirm === true || token.customer_confirm === true;
  
  const callStartedAt =
    Number(token._callStartedAt) ||
    (token.calledAt || token.called_at
      ? new Date(token.calledAt || token.called_at).getTime()
      : 0);

  const elapsedSeconds = callStartedAt
    ? Math.floor((timerNow - callStartedAt) / 1000)
    : 0;

  const remainingSeconds = Math.max(0, callTimeoutSeconds - elapsedSeconds);
  const timerExpired = isCalled && callStartedAt > 0 && remainingSeconds <= 0;
  const canFinalize = isImHere || timerExpired;

  return (
    <div
      className={`p-3 border rounded-lg flex flex-col justify-between gap-3 shadow-2xs ${
        isImHere ? "border-emerald-300 bg-emerald-50/40" : "border-amber-200 bg-amber-50/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-2 text-xs flex-1">
          <div>
            <span className="block text-[10px] font-bold text-slate-400">TOKEN</span>
            <strong className={`${isCalled ? "text-2xl" : "text-base"} font-black text-blue-600`}>
              {token.token_no || token.tokenNo}
            </strong>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400">CUSTOMER</span>
            <strong className="text-slate-700 truncate block">{token.customer_name || token.name}</strong>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400">GROUP SIZE</span>
            <strong className="text-slate-700">{token.group_size ?? token.groupSize ?? "-"}</strong>
          </div>
        </div>
      </div>

      {canFinalize ? (
        <>
          <p className={`text-center text-sm font-extrabold ${isImHere && customerConfirmed ? "text-emerald-700" : "text-red-600"}`}>
            {isImHere
              ? (customerConfirmed ? "Customer Confirmed the Token" : "Customer is here")
              : "Customer Not Confirmed the Token"}
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => updateArrivalStatus(token.id, "arrived")}
              className="flex-1 h-9 border border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 rounded-md text-xs font-bold transition-all shadow-xs"
            >
              ARRIVED ✅
            </button>

            <button
              onClick={() => updateArrivalStatus(token.id, "not_arrived")}
              className="flex-1 h-9 border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 rounded-md text-xs font-bold transition-all"
            >
              NOT ARRIVED ❌
            </button>
          </div>
        </>
      ) : (
        <div className="pt-2 border-t border-slate-200 text-center">
          {isCalled ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-extrabold tabular-nums text-amber-800">
                {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
              </span>
              <span className="text-[11px] font-semibold text-amber-700">Time remaining</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}