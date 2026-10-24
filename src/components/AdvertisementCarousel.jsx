// import { useEffect, useRef, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { AdvertisementCard } from "./AdvertisementCard";
// import { getAdvertisementsApi } from "../api/advertisements.api";
// import { useTokenStore } from "../store/token.store";

// export default function AdvertisementCarousel({
//   ads,
//   shopId: shopIdProp,
//   placement = "shop_list",
//   autoSlide = true,
//   slideInterval = 5000,
//   onAdClick,
//   customer: customerProp,
// }) {
//   const currentTokenId = useTokenStore((state) => state.currentTokenId);
//   const currentMobile = useTokenStore((state) => state.currentMobile);
//   const currentShop = useTokenStore((state) => state.currentShop);
//   const currentCustomerName = useTokenStore((state) => state.currentCustomerName);

//   const shopId = shopIdProp ?? currentShop?.shopId ?? currentShop?.id ?? null;

//   const customer = customerProp ?? {
//     id: currentTokenId ?? null,
//     name: currentCustomerName ?? null,
//     mobile: currentMobile ?? null,
//   };

//   const [fetchedAds, setFetchedAds] = useState([]);
//   const [loading, setLoading] = useState(!ads);
//   const [current, setCurrent] = useState(0);
//   const [paused, setPaused] = useState(false);

//   const touchStartX = useRef(0);
//   const touchEndX = useRef(0);

//   // Fetch Advertisements if not passed via props
//   useEffect(() => {
//     if (ads !== undefined && ads !== null) {
//       setLoading(false);
//       return;
//     }

//     let mounted = true;

//     const fetchAdvertisements = async () => {
//       setLoading(true);

//       try {
//         const result = await getAdvertisementsApi({
//           placement,
//           ...(shopId != null ? { shopId } : {}),
//         });

//         if (mounted) {
//           const validAds = (result?.advertisements ?? []).filter(
//             (ad) => (ad.is_active ?? ad.isActive) !== false
//           );
//           setFetchedAds(validAds);
//         }
//       } catch (error) {
//         if (mounted) setFetchedAds([]);
//         console.error("Failed to load advertisements:", error);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     fetchAdvertisements();

//     return () => {
//       mounted = false;
//     };
//   }, [ads, placement, shopId]);

//   const activeAds = ads ?? fetchedAds;

//   // Next / Previous controls
//   const nextSlide = () => {
//     if (activeAds.length === 0) return;
//     setCurrent((prev) => (prev + 1) % activeAds.length);
//   };

//   const prevSlide = () => {
//     if (activeAds.length === 0) return;
//     setCurrent((prev) => (prev - 1 + activeAds.length) % activeAds.length);
//   };

//   // Auto slide timer
//   useEffect(() => {
//     if (!autoSlide || paused || activeAds.length <= 1) return;

//     const interval = setInterval(() => {
//       nextSlide();
//     }, slideInterval);

//     return () => clearInterval(interval);
//   }, [autoSlide, paused, activeAds.length, slideInterval]);

//   // Touch handlers for mobile swipe
//   const handleTouchStart = (e) => {
//     touchStartX.current = e.targetTouches[0].clientX;
//   };

//   const handleTouchMove = (e) => {
//     touchEndX.current = e.targetTouches[0].clientX;
//   };

//   const handleTouchEnd = () => {
//     if (!touchStartX.current || !touchEndX.current) return;
//     const distance = touchStartX.current - touchEndX.current;
//     if (distance > 50) {
//       nextSlide(); // Swiped left
//     } else if (distance < -50) {
//       prevSlide(); // Swiped right
//     }
//     touchStartX.current = 0;
//     touchEndX.current = 0;
//   };

//   if (loading) {
//     return (
//       <div className="w-full aspect-[8/3] bg-gray-200 animate-pulse rounded-2xl" />
//     );
//   }

//   if (!activeAds || activeAds.length === 0) {
//     return null;
//   }

//   return (
//     <div
//       className="relative w-full overflow-hidden group"
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={handleTouchEnd}
//     >
//       {/* Slider Container */}
//       <div
//         className="flex transition-transform duration-500 ease-out"
//         style={{ transform: `translateX(-${current * 100}%)` }}
//       >
//         {activeAds.map((ad, idx) => (
//           <div key={ad._id || ad.id || idx} className="w-full flex-shrink-0">
//             <AdvertisementCard
//               advertisement={ad}
//               onClick={onAdClick}
//               shopId={shopId}
//               placement={placement}
//               customer={customer}
//             />
//           </div>
//         ))}
//       </div>

//       {/* Left / Right Buttons (Visible if more than 1 ad exists) */}
//       {activeAds.length > 1 && (
//         <>
//           <button
//             onClick={prevSlide}
//             className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
//             aria-label="Previous Slide"
//           >
//             <ChevronLeft className="w-5 h-5" />
//           </button>
//           <button
//             onClick={nextSlide}
//             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
//             aria-label="Next Slide"
//           >
//             <ChevronRight className="w-5 h-5" />
//           </button>

//           {/* Dots Indicator */}
//           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
//             {activeAds.map((_, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setCurrent(idx)}
//                 className={`w-2 h-2 rounded-full transition-all ${
//                   current === idx ? "bg-white w-4" : "bg-white/50"
//                 }`}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdvertisementCard } from "./AdvertisementCard";
import { getLiveAdvertisementsApi } from "../api/advertisements.api";
import { useTokenStore } from "../store/token.store";

export default function AdvertisementCarousel({
  ads,
  shopId: shopIdProp,
  placement = "shop_list",
  autoSlide = true,
  slideInterval = 5000,
  onAdClick,
  customer: customerProp,
}) {
  const currentTokenId = useTokenStore((state) => state.currentTokenId);
  const currentMobile = useTokenStore((state) => state.currentMobile);
  const currentShop = useTokenStore((state) => state.currentShop);
  const currentCustomerName = useTokenStore((state) => state.currentCustomerName);

  const shopId = shopIdProp ?? currentShop?.shopId ?? currentShop?.id ?? null;

  const customer = customerProp ?? {
    id: currentTokenId ?? null,
    name: currentCustomerName ?? null,
    mobile: currentMobile ?? null,
  };

  const [fetchedAds, setFetchedAds] = useState([]);
  const [loading, setLoading] = useState(!ads);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch Advertisements if not passed via props
  useEffect(() => {
    if (ads !== undefined && ads !== null) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchAdvertisements = async () => {
      setLoading(true);

      try {
        const liveAds = await getLiveAdvertisementsApi({
          placement,
          ...(shopId != null ? { shopId } : {}),
        });

        if (mounted) setFetchedAds(Array.isArray(liveAds) ? liveAds : []);
      } catch (error) {
        if (mounted) setFetchedAds([]);
        console.error("Failed to load advertisements:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAdvertisements();

    return () => {
      mounted = false;
    };
  }, [ads, placement, shopId]);

  const activeAds = ads ?? fetchedAds;

  useEffect(() => {
    setCurrent((index) => Math.min(index, Math.max(activeAds.length - 1, 0)));
  }, [activeAds.length]);

  // Next / Previous controls
  const nextSlide = () => {
    if (activeAds.length === 0) return;
    setCurrent((prev) => (prev + 1) % activeAds.length);
  };

  const prevSlide = () => {
    if (activeAds.length === 0) return;
    setCurrent((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  };

  // Auto slide timer
  useEffect(() => {
    if (!autoSlide || paused || activeAds.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, paused, activeAds.length, slideInterval]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide(); // Swiped left
    } else if (distance < -50) {
      prevSlide(); // Swiped right
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <div className="w-full aspect-[8/3] bg-gray-200 animate-pulse rounded-2xl" />
    );
  }

  if (!activeAds || activeAds.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full overflow-hidden group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {activeAds.map((ad, idx) => (
          <div key={ad._id || ad.id || idx} className="w-full flex-shrink-0">
            <AdvertisementCard
              advertisement={ad}
              onClick={onAdClick}
              shopId={shopId}
              placement={placement}
              customer={customer}
              isVisible={idx === current}
            />
          </div>
        ))}
      </div>

      {/* Left / Right Buttons (Visible if more than 1 ad exists) */}
      {activeAds.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {activeAds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  current === idx ? "bg-white w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}