import React, { useEffect, useState, useRef } from "react";
import { HiExternalLink } from "react-icons/hi";
import { useLocation } from "react-router-dom";

export default function LmsPromoPrompt({
  lmsUrl = "https://isra-lms-web-app.vercel.app",
}) {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();

  const showTimerRef = useRef(null);
  const autoHideTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    // Vercel build / SSR gibi ortamlarda window yoksa hiçbir şey yapma
    if (typeof window === "undefined") return;

    // Dashboard içinde gösterme
    if (location.pathname.startsWith("/sura-dashboard")) return;

    let shownThisSession = null;
    try {
      shownThisSession = window.sessionStorage.getItem("lmsPromoShown");
    } catch (err) {
      // sessionStorage erişilemezse sessizce devam
      console.warn("[LmsPromoPrompt] sessionStorage not available", err);
    }

    // Session boyunca sadece 1 kez göster
    if (shownThisSession === "true") return;

    // Banner'ı 3 saniye sonra göster
    showTimerRef.current = window.setTimeout(() => {
      setShow(true);

      // Otomatik kapanma (5 saniye sonra)
      autoHideTimerRef.current = window.setTimeout(() => {
        setFadeOut(true);
        fadeTimerRef.current = window.setTimeout(() => setShow(false), 500);
      }, 5000);

      // Session'da bir daha gösterme
      try {
        window.sessionStorage.setItem("lmsPromoShown", "true");
      } catch (err) {
        console.warn("[LmsPromoPrompt] cannot write to sessionStorage", err);
      }
    }, 3000);

    // Cleanup: route değişince veya component unmount olunca tüm timer’ları temizle
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (autoHideTimerRef.current) window.clearTimeout(autoHideTimerRef.current);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    };
  }, [location.pathname]); // sadece pathname değişince tetiklensin

  const handleOpenLms = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "click_lms_promo", {
        event_category: "engagement",
        event_label: "ISRA_LMS_Promo",
      });
    }

    if (typeof window !== "undefined") {
      window.open(lmsUrl, "_blank", "noopener,noreferrer");
    }

    // Kapanış animasyonu
    setFadeOut(true);
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = window.setTimeout(() => setShow(false), 500);
  };

  const handleClose = () => {
    setFadeOut(true);
    if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = window.setTimeout(() => setShow(false), 500);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white 
        px-4 py-3 rounded-2xl shadow-xl z-[100] w-[90%] sm:w-auto 
        text-center transition-all duration-500 ${
          fadeOut ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm sm:text-base">
            Track your team&apos;s Quran & progress 📊
          </p>
          <p className="text-xs sm:text-sm opacity-90">
            Open ISRA LMS dashboard to manage students, teams and tasks in one place.
          </p>
        </div>

        {/* Open LMS */}
        <button
          onClick={handleOpenLms}
          className="px-4 py-1.5 bg-white text-indigo-700 font-semibold 
            rounded-full text-xs sm:text-sm shadow-md hover:bg-indigo-100 
            active:scale-95 transition-all duration-300 flex items-center"
        >
          Open LMS
          <HiExternalLink className="ml-1 w-4 h-4" />
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="ml-1 text-white/80 hover:text-white text-sm px-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
