import React, { useState, useEffect, useRef } from "react";
import { Mic, Check, X, ArrowRight, Play, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const LYNCH_COMMENTS = [
  "Bu ne biçim ses?!",
  "Kulaklarım kanadı!",
  "Detone kraliçesi!",
  "Sahneden in!",
  "Playback yapsaydın keşke...",
];

const LEVEL_LYRICS: Record<number, string[]> = {
  1: ["Hayallerim...", "Çok uzak değil...", "Yolun başındayım...", "Parlamaya hazırım!"],
  2: ["Ritim kalbimde!", "Dans et bu gece!", "Kimse durduramaz!", "Zirve benim!"],
  3: ["Yıldızlar altında...", "Sessizce ağladım...", "Ama şimdi buradayım!", "Işığım sönmeyecek..."],
  4: ["DÜNYA BENİ BEKLİYOR!", "SAHNE BİZİM!", "KORKU YOK!", "SONSUZA KADAR..."]
};

const LEVEL_COLORS: Record<number, string> = {
  1: "from-blue-600 to-cyan-500",
  2: "from-purple-600 to-pink-500",
  3: "from-amber-500 to-orange-600",
  4: "from-rose-600 via-purple-600 to-indigo-600"
};

export function VocalMinigame({
  onComplete,
  level = 1,
}: {
  onComplete: (success: boolean) => void;
  level?: number;
}) {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showMessage, setShowMessage] = useState<"hit" | "miss" | null>(null);
  const [targetCenter, setTargetCenter] = useState(50);
  const [distractions, setDistractions] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Game parameters based on level
  const speed = level === 1 ? 2 : level === 2 ? 4 : level === 3 ? 5 : 6.5;
  const targetArea = level === 1 ? 30 : level === 2 ? 22 : level === 3 ? 18 : 16;
  const requiredHits = level === 1 ? 4 : level === 2 ? 4 : level === 3 ? 4 : 4;
  const allowedMisses = 3;

  const currentLyric = LEVEL_LYRICS[level]?.[hits] || LEVEL_LYRICS[level]?.[LEVEL_LYRICS[level].length-1];

  // Level titles
  const levelTitle = 
    level === 1 ? "Level 1: Ton Tutturma" : 
    level === 2 ? "Level 2: Pop Rüzgarı" : 
    level === 3 ? "Level 3: Duygusal Ballad" : 
    "Level 4: Epik Final";

  const levelDesc = 
    level === 1 ? "Yeşil alan sabit. Ritmi yakala!" :
    level === 2 ? "Tempo arttı! Şarkıya odaklan." :
    level === 3 ? "Nota geçişleri hızlanıyor! Takip et." :
    "Tüm dünya seni dinliyor! Linçlere rağmen şarkını söyle!";

  // For level 3 and 4, target center moves randomly every hit or every 2 seconds
  useEffect(() => {
    if (isDone || level < 3) return;
    const interval = setInterval(() => {
      setTargetCenter(20 + Math.random() * 60);
    }, level === 4 ? 1200 : 2000);
    return () => clearInterval(interval);
  }, [level, isDone]);

  // For level 4, random distractions
  useEffect(() => {
    if (isDone || level < 4) return;
    const interval = setInterval(() => {
      setDistractions((prev) => [
        ...prev.slice(-4),
        {
          id: Date.now(),
          text: LYNCH_COMMENTS[Math.floor(Math.random() * LYNCH_COMMENTS.length)],
          x: Math.random() * 80,
          y: Math.random() * 80,
        },
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, [level, isDone]);

  useEffect(() => {
    if (isDone) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
        let next = prev + direction * speed;
        if (next >= 100) {
          next = 100;
          setDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [direction, isDone, speed]);

  const lastSingRef = useRef<number>(0);

  const handleSing = () => {
    if (isDone) return;
    const now = Date.now();
    if (now - lastSingRef.current < 400) return; 
    
    const isHit = position >= targetCenter - targetArea/2 && position <= targetCenter + targetArea/2;

    lastSingRef.current = now;

    if (isHit) {
      const newHits = hits + 1;
      setHits(newHits);
      setShowMessage("hit");
      if (level >= 3) {
        setTargetCenter(20 + Math.random() * 60);
      }
      if (newHits >= requiredHits) {
        setIsDone(true);
        setTimeout(() => onComplete(true), 1500);
      }
    } else { 
      const newMisses = misses + 1;
      setMisses(newMisses);
      setShowMessage("miss");
      if (newMisses >= allowedMisses) {
         setIsDone(true);
         setTimeout(() => onComplete(false), 1500);
      }
    }
    setTimeout(() => setShowMessage(null), 600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleSing();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDone, position, hits, targetCenter]);

  return (
    <div className={`bg-slate-950 p-8 rounded-3xl border border-white/10 text-center w-full max-w-md mx-auto shadow-2xl relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${LEVEL_COLORS[level]} opacity-10`} />
      
      {/* Distractions for Level 4 */}
      <AnimatePresence>
        {level === 4 && distractions.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute text-[10px] font-bold text-white bg-rose-600 px-3 py-1 rounded-full shadow-lg z-10 whitespace-nowrap pointer-events-none border border-rose-400"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            {d.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto mb-4 relative z-20 border border-white/10">
        <Mic size={32} />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-1 relative z-20">{levelTitle}</h3>
      <p className="text-white/60 mb-6 text-[10px] md:text-xs relative z-20 h-4">
        {levelDesc}
      </p>

      {/* Karaoke Lyrics Screen */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 relative z-20 min-h-[60px] flex items-center justify-center overflow-hidden">
         <AnimatePresence mode="wait">
            <motion.p
              key={currentLyric}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent italic"
            >
              {currentLyric}
            </motion.p>
         </AnimatePresence>
      </div>

      <div className="relative w-full h-10 bg-slate-900/60 rounded-full overflow-hidden mb-6 border border-white/5 z-20">
        <motion.div 
          animate={{ left: `${targetCenter - targetArea/2}%`, width: `${targetArea}%` }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 bottom-0 bg-emerald-500/20 border-x-2 border-emerald-400/50"
        />
        <div
          className="absolute top-1 bottom-1 w-1.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-75"
          style={{ left: `calc(${position}% - 3px)` }}
        />
      </div>

      <div className="flex justify-center gap-6 mb-4 text-xs font-bold relative z-20 tracking-wider uppercase opacity-80">
        <span className="text-emerald-400">Nota: {hits}/{requiredHits}</span>
        <span className="text-rose-400">Hata: {misses}/{allowedMisses}</span>
      </div>

      <div className="h-6 mb-4 relative z-20 flex justify-center items-center">
        <AnimatePresence mode="popLayout">
          {showMessage === "hit" && (
            <motion.span 
              initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: -10 }}
              className="text-emerald-400 font-black text-sm drop-shadow-sm"
            >
              MÜKEMMEL! 🎵
            </motion.span>
          )}
          {showMessage === "miss" && (
            <motion.span 
              initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: -10 }}
              className="text-rose-400 font-black text-sm drop-shadow-sm"
            >
              KAÇIRDIN! ❌
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => handleSing()}
        disabled={isDone}
        className={`w-full py-4 bg-gradient-to-r ${LEVEL_COLORS[level]} hover:brightness-110 disabled:opacity-30 text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 relative z-20 border border-white/10`}
      >
        <Play size={20} fill="currentColor" />
        SÖYLE
      </button>
    </div>
  );
}
