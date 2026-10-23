
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import { useTokenStore } from "../store/token.store";

export default function TokenCallListener() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTokenId = useTokenStore(
    (state) => state.currentTokenId
  );

  const currentMobile = useTokenStore(
    (state) => state.currentMobile
  );

  const currentShop = useTokenStore(
    (state) => state.currentShop
  );

  // Latest values listener ke andar available rahenge
  const latestRef = useRef({});

  useEffect(() => {
    latestRef.current = {
      currentTokenId,
      currentMobile,
      currentShop,
    };
  }, [currentTokenId, currentMobile, currentShop]);

  useEffect(() => {
    const handleTokenCalled = (eventData) => {
      const payload = eventData?.data ?? eventData;
      const token = payload?.token ?? payload;

      const calledTokenId =
        token?.id ??
        token?._id ??
        token?.tokenId ??
        token?.token_id;

      const savedTokenId =
        latestRef.current.currentTokenId ??
        localStorage.getItem("currentTokenId");

      // Current customer ka token hi handle karo
      if (
        calledTokenId == null ||
        savedTokenId == null ||
        String(calledTokenId) !== String(savedTokenId)
      ) {
        return;
      }

      // Agar already final-call page par hain,
      // to duplicate navigation mat karo
      if (location.pathname === "/final-call") {
        return;
      }

      const shop =
        latestRef.current.currentShop ??
        JSON.parse(localStorage.getItem("currentShop") || "null");

      const mobile =
        latestRef.current.currentMobile ??
        localStorage.getItem("currentMobile") ??
        token?.mobile;

      navigate("/final-call", {
        replace: true,
        state: {
          token,
          tokenId: calledTokenId,
          mobile,
          shop,
        },
      });
    };

    socket.on("token_called", handleTokenCalled);

    return () => {
      socket.off("token_called", handleTokenCalled);
    };
  }, [navigate, location.pathname]);

  return null;
}
