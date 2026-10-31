import React from "react";

export default function WaitingTokenCard({ token }) {
  return (
    <div className="min-w-0 border border-slate-200 rounded-lg bg-white p-3 text-xs shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm font-bold text-slate-800">
          Token #{token.token_no || token.tokenNo}
        </strong>
        <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
          {token.status || "waiting"}
        </span>
      </div>
      <p className="mt-1 truncate font-semibold text-slate-700">
        {token.customer_name || token.name}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {(token.group_size != null || token.groupSize != null) && (
          <span>{token.group_size || token.groupSize} people</span>
        )}
      </div>
    </div>
  );
}