import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CinematicType, CINEMATIC_VIDEOS } from "../data/cinematics";

interface CinematicPlayerProps {
  type: CinematicType;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
}

export default function CinematicPlayer({
  type,
  onComplete,
  title,
  subtitle,
}: CinematicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = CINEMATIC_VIDEOS[type];

  const handleComplete = () => {
    onComplete();
  };

  if (!videoUrl || videoUrl.includes("example.com")) {
    setTimeout(onComplete, 100);
    return null;
  }

  // YouTube ID'yi URL'den çıkar
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) {
    setTimeout(onComplete, 100);
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      {/* iframe ile YouTube */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ border: "none", pointerEvents: "auto" }}
          onLoad={() => setIsPlaying(true)}
        />
      </div>

      {/* Cinematic Text Overlay */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pointer-events-none">
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5 }}
            >
              {title && (
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-widest uppercase drop-shadow-2xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg md:text-2xl text-slate-300 font-light italic leading-relaxed tracking-wide drop-shadow-lg">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={handleComplete}
        className="absolute bottom-8 right-8 text-white/50 hover:text-white/90 uppercase tracking-widest text-xs font-semibold px-4 py-2 border border-white/20 rounded-full bg-black/30 backdrop-blur-sm transition-all z-20 cursor-pointer pointer-events-auto"
      >
        Geç (Atla)
      </motion.button>
    </motion.div>
  );
}