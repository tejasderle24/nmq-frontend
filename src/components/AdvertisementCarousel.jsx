import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdvertisementCard } from "./AdvertisementCard";
import { getAdvertisementsApi } from "../api/advertisements.api";
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
  // Read current customer and shop details from Zustand
  const currentTokenId = useTokenStore(
    (state) => state.currentTokenId
  );

  const currentMobile = useTokenStore(
    (state) => state.currentMobile
  );

  const currentShop = useTokenStore(
    (state) => state.currentShop
  );

  const currentCustomerName = useTokenStore(
    (state) => state.currentCustomerName
  );

  // Explicitly passed props take priority over store values
  const shopId = shopIdProp ?? currentShop?.shopId ?? null;

  const customer = customerProp ?? {
    id: currentTokenId ?? null,
    name: currentCustomerName ?? null,
    mobile: currentMobile ?? null,
  };

  const [fetchedAds, setFetchedAds] = useState([]);
  const [loading, setLoading] = useState(!ads);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (ads !== undefined && ads !== null) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchAdvertisements = async () => {
      setLoading(true);

      try {
        const result = await getAdvertisementsApi({
          placement,
          ...(shopId != null ? { shopId } : {}),
        });

        if (mounted) {
          setFetchedAds(
            (result?.advertisements ?? []).filter(
              (ad) => ad.is_active ?? ad.isActive
            )
          );
        }
      } catch (error) {
        if (mounted) setFetchedAds([]);

        console.error(
          "Failed to load advertisements:",
          error
        );
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
    setCurrent((index) =>
      Math.min(index, Math.max(activeAds.length - 1, 0))
    );
  }, [activeAds.length]);

  const nextSlide = () => {
    if (activeAds.length <= 1) return;

    setVisible(false);

    setTimeout(() => {
      setCurrent((prev) =>
        prev === activeAds.length - 1 ? 0 : prev + 1
      );
      setVisible(true);
    }, 180);
  };

  const previousSlide = () => {
    if (activeAds.length <= 1) return;

    setVisible(false);

    setTimeout(() => {
      setCurrent((prev) =>
        prev === 0 ? activeAds.length - 1 : prev - 1
      );
      setVisible(true);
    }, 180);
  };

  // Auto rotation
  useEffect(() => {
    if (
      loading ||
      !autoSlide ||
      paused ||
      activeAds.length <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === activeAds.length - 1 ? 0 : prev + 1
      );
    }, slideInterval);

    return () => clearInterval(timer);
  }, [
    loading,
    activeAds.length,
    autoSlide,
    slideInterval,
    paused,
  ]);

  const handleTouchStart = (event) => {
    setPaused(true);
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    touchEndX.current = event.changedTouches[0].clientX;

    const distance =
      touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextSlide();
      } else {
        previousSlide();
      }
    }

    setPaused(false);
  };

  const handleAdvertisementClick = (ad) => {
    onAdClick?.(ad);
  };

  if (loading && activeAds.length === 0) {
    return null;
  }

  if (activeAds.length === 0) {
    return null;
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative w-full my-3 sm:my-4 md:my-6 group"
    >
      <div
        className={`transition-all duration-300 ease-out ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-1.5 scale-[0.985]"
        }`}
      >
        <AdvertisementCard
          key={
            activeAds[current]?._id ??
            activeAds[current]?.id
          }
          advertisement={activeAds[current]}
          onClick={handleAdvertisementClick}
          shopId={shopId}
          placement={placement}
          customer={customer}
        />
      </div>

      {activeAds.length > 1 && (
        <>
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {activeAds.map((ad, index) => (
              <button
                type="button"
                key={ad._id ?? ad.id ?? index}
                aria-label={`Show advertisement ${index + 1}`}
                onClick={() => {
                  if (index === current) return;

                  setVisible(false);

                  setTimeout(() => {
                    setCurrent(index);
                    setVisible(true);
                  }, 180);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-out ${
                  index === current
                    ? "w-6 sm:w-8 bg-[#FC8019]"
                    : "w-1.5 sm:w-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
