import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/auth.store";
import { socket } from "../../utils/socket";

// Components
import StaffHeader from "../../components/staff/StaffHeader";
import StaffSidebar from "../../components/staff/StaffSidebar";
import QueueSection from "../../components/staff/QueueSection";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function StaffDashboard() {
  const { user, logout } = useAuthStore();
  const [staffProfile, setStaffProfile] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // UI States for filtering queues and viewing data
  const [selectedQueues, setSelectedQueues] = useState(["ALL"]);
  const [waitingTokens, setWaitingTokens] = useState([]);
  const [pendingArrivals, setPendingArrivals] = useState([]);
  const [timerNow, setTimerNow] = useState(Date.now());
  const CALL_TIMEOUT_SECONDS = 120;

  const currentDate = new Date();
  const date = currentDate.toLocaleDateString();
  const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const queuesList = [
    { key: "Q2", name: "Queue 2 Persons", color: "orange" },
    { key: "Q4", name: "Queue 4 Persons", color: "emerald" },
    { key: "Q6", name: "Queue 6 Persons", color: "blue" },
    { key: "Q8", name: "Queue 8 Persons", color: "purple" },
  ];

  // Calculate dynamic waiting counts per queue
  const counts = queuesList.reduce((acc, q) => {
    acc[q.key] = waitingTokens.filter((t) => {
      const qType = (t.queue_type || t.queueType || "").toUpperCase();
      return qType === q.key;
    }).length;
    return acc;
  }, {});

  // Refresh the per-token countdown only while a called token still needs a response.
  useEffect(() => {
    const hasActiveCountdown = pendingArrivals.some((token) => {
      const status = String(token.status || "").toLowerCase();
      if (status !== "called") return false;

      const rawCalledAt = token.calledAt || token.called_at;
      let parsedCalledAt = 0;
      if (rawCalledAt) {
        let fixedDateStr = rawCalledAt;
        if (typeof fixedDateStr === 'string' && !fixedDateStr.endsWith('Z') && !fixedDateStr.includes('+')) {
          fixedDateStr += 'Z';
        }
        parsedCalledAt = new Date(fixedDateStr).getTime();
      }

      const startedAt = Number(token._callStartedAt) || parsedCalledAt;

      // Agar fir bhi 5.5 hours ka gap dikh raha hai (yani server aur client time sync nahi hai),
      // toh aap yahan directly current client time ko hi fallback maan sakte hain jab token call hua ho:
      return startedAt && (timerNow - startedAt) < CALL_TIMEOUT_SECONDS * 1000;
    });

    if (!hasActiveCountdown) return;
    const interval = setInterval(() => setTimerNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [pendingArrivals, timerNow]);

  // const addCallTimer = (token) => {
  //   const rawCalledAt = token.calledAt || token.called_at;
  //   let parsedTime = 0;
  //   console.log("rawCalledAt", rawCalledAt)
  //   console.log("Date.now()", Date.now())

  //   if (rawCalledAt) {
  //     // Agar backend se string aayi hai, ensure karo ki woh UTC / ISO format mein sahi se parse ho
  //     // Agar uske end mein 'Z' ya offset nahi hai, toh date parse me gadbad ho sakti hai.
  //     let fixedDateStr = rawCalledAt;
  //     if (typeof fixedDateStr === 'string' && !fixedDateStr.endsWith('Z') && !fixedDateStr.includes('+')) {
  //       fixedDateStr += 'Z'; // Force UTC agar timezone missing hai
  //     }
  //     parsedTime = new Date(fixedDateStr).getTime();
  //   }

  //   return {
  //     ...token,
  //     _callStartedAt: Number(token?._callStartedAt) || parsedTime || Date.now(),
  //   };
  // };


  const addCallTimer = (token) => {
      // Agar pehle se _callStartedAt set nahi hai, toh abhi ka exact client time do
      // Taaki UTC/IST ka 5.5 hours ka gap kabhi aaye hi na!
      return {
        ...token,
        _callStartedAt: Number(token?._callStartedAt) || Date.now(),
      };
    };

  const toggleQueue = (queueKey) => {
    if (queueKey === "ALL") {
      setSelectedQueues(["ALL"]);
    } else {
      let updated = selectedQueues.filter((k) => k !== "ALL");
      if (updated.includes(queueKey)) {
        updated = updated.filter((k) => k !== queueKey);
      } else {
        updated.push(queueKey);
      }
      if (updated.length === 0) updated = ["ALL"];
      setSelectedQueues(updated);
    }
  };

  const isQueueVisible = (queueKey) => {
    return selectedQueues.includes("ALL") || selectedQueues.includes(queueKey);
  };

  // 1. Fetch staff profile and shop details on load with Bearer token
  useEffect(() => {
    const fetchStaffProfile = async () => {
      if (!user?.id) return;
      try {
        setLoadingProfile(true);
        const token = useAuthStore.getState().accessToken;

        const res = await fetch(`${BASE_URL}/staff/${user.id}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const result = await res.json();

        if (result.success && result.data) {
          setStaffProfile(result.data.user);
          setShopProfile(result.data.shop);
        }
      } catch (err) {
        console.error("Error fetching staff profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchStaffProfile();
  }, [user?.id]);

  // 2. Fetch initial waiting tokens once shopProfile is loaded
  useEffect(() => {
    const fetchInitialTokens = async () => {
      if (!shopProfile?.id) return;
      try {
        const token = useAuthStore.getState().accessToken;
        const res = await fetch(`${BASE_URL}/tokens/waiting?shopId=${shopProfile.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        const data = await res.json();
        if (data.success && data.tokens) {
          const tokens = data.tokens;
          const waiting = tokens.filter((item) => String(item.status || "waiting").toLowerCase() === "waiting");
          const active = tokens
            .filter((item) => ["called", "imhere", "im-here"].includes(String(item.status || "").toLowerCase()))
            .map((item) => String(item.status || "").toLowerCase() === "called" ? addCallTimer(item) : item);

          setWaitingTokens(waiting);
          setPendingArrivals(active);
          setTimerNow(Date.now());
        }
      } catch (err) {
        console.error("Failed to load initial waiting tokens:", err);
      }
    };

    fetchInitialTokens();
  }, [shopProfile?.id]);

  // 3. Shared Socket.IO connection and shop-scoped live events.
  useEffect(() => {
    const shopId = shopProfile?.id ?? shopProfile?.shopId;
    if (shopId == null) return;

    const joinShop = () => {
      socket.emit("join-shop", { shopId: Number(shopId) });
    };

    const unwrapToken = (payload) => {
      const data = payload?.data ?? payload;
      return data?.token ?? data;
    };

    const handleNewToken = (payload) => {
      const token = unwrapToken(payload);
      if (Number(token?.shopId ?? token?.shop_id) !== Number(shopId)) return;
      if (token.status !== "waiting") return;

      setWaitingTokens((prev) => {
        if (prev.some((item) => String(item.id) === String(token.id))) return prev;
        return [...prev, token].sort(
          (a, b) => Number(a.tokenNo ?? a.token_no) - Number(b.tokenNo ?? b.token_no)
        );
      });
    };

    const handleTokenCancelled = (payload) => {
      const token = unwrapToken(payload);
      if (Number(token?.shopId ?? token?.shop_id) !== Number(shopId)) return;
      setWaitingTokens((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
      setPendingArrivals((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
    };

    const handleTokenCalled = (payload) => {
      const rawToken = unwrapToken(payload);
      if (Number(rawToken?.shopId ?? rawToken?.shop_id) !== Number(shopId)) return;
      const token = addCallTimer(rawToken);

      setWaitingTokens((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
      setPendingArrivals((prev) => {
        if (prev.some((item) => String(item.id) === String(token.id))) {
          return prev.map((item) =>
            String(item.id) === String(token.id)
              ? { ...item, ...token, _callStartedAt: item._callStartedAt || token._callStartedAt }
              : item
          );
        }
        return [...prev, token];
      });
      setTimerNow(Date.now());
    };

    const handleTokenImHere = (payload) => {
      const rawToken = unwrapToken(payload);
      if (Number(rawToken?.shopId ?? rawToken?.shop_id) !== Number(shopId)) return;
      const token = { ...rawToken, status: rawToken.status || "imhere" };

      setPendingArrivals((prev) => {
        if (prev.some((item) => String(item.id) === String(token.id))) {
          return prev.map((item) =>
            String(item.id) === String(token.id) ? { ...item, ...token } : item
          );
        }
        return [...prev, token];
      });
    };

    const handleArrivalUpdated = (payload) => {
      const token = unwrapToken(payload);
      if (Number(token?.shopId ?? token?.shop_id) !== Number(shopId)) return;
      setPendingArrivals((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
      setWaitingTokens((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
    };

    socket.on("connect", joinShop);
    socket.on("new_token_created", handleNewToken);
    socket.on("token_cancelled", handleTokenCancelled);
    socket.on("token_called", handleTokenCalled);
    socket.on("token_im_here", handleTokenImHere);
    socket.on("token_arrival_updated", handleArrivalUpdated);

    if (socket.connected) joinShop();

    return () => {
      socket.off("connect", joinShop);
      socket.off("new_token_created", handleNewToken);
      socket.off("token_cancelled", handleTokenCancelled);
      socket.off("token_called", handleTokenCalled);
      socket.off("token_im_here", handleTokenImHere);
      socket.off("token_arrival_updated", handleArrivalUpdated);
    };
  }, [shopProfile?.id, shopProfile?.shopId]);

  const handleCallNext = async (queueType) => {
    try {
      const token = useAuthStore.getState().accessToken;

      const res = await fetch(`${BASE_URL}/tokens/call-next?shopId=${shopProfile?.id ?? shopProfile?.shopId}&queueType=${encodeURIComponent(queueType)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        const calledToken = addCallTimer(data.data);
        setTimerNow(Date.now());
        console.log("=======================================================");

        console.log("calledToken", calledToken)
        console.log(setTimerNow, "setTimerNow");

        setPendingArrivals((prev) => {
          if (prev.some((t) => String(t.id) === String(calledToken.id))) {
            return prev.map((t) => String(t.id) === String(calledToken.id)
              ? { ...t, ...calledToken, _callStartedAt: t._callStartedAt || calledToken._callStartedAt }
              : t);
          }
          return [...prev, calledToken];
        });
        setWaitingTokens((prev) => prev.filter((t) => t.id !== calledToken.id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error calling next token:", err);
    }
  };

  const updateArrivalStatus = async (tokenId, status) => {
    try {
      const token = useAuthStore.getState().accessToken;

      const res = await fetch(`${BASE_URL}/tokens/${tokenId}/arrival-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingArrivals((prev) => prev.filter((t) => t.id !== tokenId));
      }
    } catch (err) {
      console.error("Error updating arrival status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER */}
      <StaffHeader
        shopProfile={shopProfile}
        staffProfile={staffProfile}
        user={user}
        date={date}
        time={time}
        logout={logout}
      />

      {/* BODY LAYOUT: ASIDE + MAIN */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* ASIDE NAVIGATION */}
        <StaffSidebar
          queuesList={queuesList}
          selectedQueues={selectedQueues}
          toggleQueue={toggleQueue}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-6">
            {queuesList.map(
              (q) =>
                isQueueVisible(q.key) && (
                  <QueueSection
                    key={q.key}
                    q={q}
                    counts={counts}
                    waitingTokens={waitingTokens}
                    pendingArrivals={pendingArrivals}
                    timerNow={timerNow}
                    CALL_TIMEOUT_SECONDS={CALL_TIMEOUT_SECONDS}
                    handleCallNext={handleCallNext}
                    updateArrivalStatus={updateArrivalStatus}
                  />
                )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}