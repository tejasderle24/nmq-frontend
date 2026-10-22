import { useEffect, useState } from "react";
import { ImageOff, ExternalLink } from "lucide-react";
import {
  recordAdvertisementClickApi,
  recordAdvertisementImpressionApi,
} from "../api/advertisements.api";

export function AdvertisementCard({
  advertisement,
  onClick,
  shopId,
  placement,
  customer,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [impressionRecorded, setImpressionRecorded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    setImpressionRecorded(false);
  }, [advertisement?._id]);

  if (!advertisement) return null;

  const advertisementId =
    advertisement._id ?? advertisement.id;

  const imageUrl =
    advertisement.image_url ?? advertisement.imageUrl;

  const redirectUrl =
    advertisement.redirect_url ?? advertisement.redirectUrl;

  const eventTitle =
    advertisement.event_title ??
    advertisement.eventTitle ??
    "Advertisement";

  const ctaText =
    advertisement.cta_text ?? advertisement.ctaText;

  const recordImpression = async () => {
    if (!advertisementId || impressionRecorded) return;

    // Prevent duplicate requests while the request is in progress.
    setImpressionRecorded(true);

    try {
      await recordAdvertisementImpressionApi(advertisementId);
    } catch (error) {
      setImpressionRecorded(false);
      console.error("Failed to record impression:", error);
    }
  };

  const handleClick = async () => {
    // Pass the exact props received from the parent.
    try {
      await recordAdvertisementClickApi(advertisementId, {
        shopId,
        placement,
        customer,
      });
    } catch (error) {
      console.error("Failed to record advertisement click:", error);
    }

    onClick?.(advertisement);

    if (redirectUrl) {
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      role="link"
      tabIndex={0}
      className={`group relative w-full aspect-[8/3] overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-amber-100/60 shadow-md hover:shadow-lg transition-all duration-300 ${
        redirectUrl ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400">
          <ImageOff className="w-8 h-8" />
          <span className="text-sm">Advertisement unavailable</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={eventTitle}
          loading="lazy"
          draggable={false}
          onLoad={() => {
            setLoaded(true);
            if (!impressionRecorded) recordImpression();
          }}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {ctaText && redirectUrl && (
        <div className="absolute right-3 bottom-3 px-4 py-2 rounded-full bg-white/90 text-[#E65100] text-sm font-bold shadow-md flex items-center gap-1 pointer-events-none">
          <span>{ctaText}</span>
          <ExternalLink className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}