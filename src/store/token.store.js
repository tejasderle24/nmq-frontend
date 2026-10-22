
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useTokenStore = create(
  persist(
    (set) => ({
      currentTokenId: null,
      currentCustomerName: "",
      currentMobile: "",
      currentShop: null,

      // Save token details
      setCurrentToken: ({ tokenId, mobile, shop, name }) =>
        set({
          currentTokenId: tokenId,
          currentCustomerName: name,
          currentMobile: mobile,
          currentShop: shop,
        }),

      // Clear token details
      clearCurrentToken: () =>
        set({
          currentTokenId: null,
          currentMobile: "",
          currentCustomerName: "",
          currentShop: null,
        }),
    }),
    {
      name: "current-token-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
