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

  // Mic features
  const [useMic, setUseMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Game parameters based on level
  const speed = level === 1 ? 2 : level === 2 ? 5 : level === 3 ? 4 : 7;
  const targetArea = level === 1 ? 30 : level === 2 ? 20 : level === 3 ? 15 : 15;
  const requiredHits = level === 1 ? 3 : level === 2 ? 4 : level === 3 ? 4 : 5;
  const allowedMisses = 2;

  // Level titles
  const levelTitle = 
    level === 1 ? "Level 1: Ton Tutturma" : 
    level === 2 ? "Level 2: Artan Tempo" : 
    level === 3 ? "Level 3: Yüksek Nota Atışı" : 
    "Level 4: Sahne Baskısı";

  const levelDesc = 
    level === 1 ? "Yeşil alan sabit. İmleç yeşil alana geldiğinde 'Söyle'ye tıkla." :
    level === 2 ? "Tempo arttı! İmleç hızlandı, odaklan." :
    level === 3 ? "Rastgele yüksek notalar çıkacak (yeşil alan hareket edecek)! Takip et." :
    "Linç yorumları ve kaos! Hedefe ulaşmaya çalış!";

  // For level 3 and 4, target center moves randomly every hit or every 2 seconds
  useEffect(() => {
    if (isDone || level < 3) return;
    const interval = setInterval(() => {
      setTargetCenter(20 + Math.random() * 60);
    }, level === 4 ? 1500 : 2500);
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
    if (isDone || !useMic) return;
    const updateVolume = () => {
      if (analyserRef.current) {
        const array = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(array);
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
          sum += array[i];
        }
        const avg = sum / array.length;
        setMicVolume(avg);
        
        if (avg > 50) {
           handleSing(true);
        }
      }
      requestRef.current = requestAnimationFrame(updateVolume);
    };
    requestRef.current = requestAnimationFrame(updateVolume);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [useMic, isDone, position, targetCenter]); 

  const initMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setUseMic(true);
    } catch(err) {
      alert("Mikrofon izni alınamadı.");
    }
  };

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

  const handleSing = (isVoice = false) => {
    if (isDone) return;
    const now = Date.now();
    if (now - lastSingRef.current < 600) return; 
    
    // In L3 and L4 target area moves
    const isHit = position >= targetCenter - targetArea/2 && position <= targetCenter + targetArea/2;
    
    if (isVoice && !isHit) return; 

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
    } else if (!isVoice) { 
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
    <div className="bg-slate-950 p-8 rounded-3xl border border-pink-500/30 text-center w-full max-w-md mx-auto shadow-[0_0_50px_rgba(236,72,153,0.2)] relative overflow-hidden">
      
      {/* Distractions for Level 4 */}
      <AnimatePresence>
        {level === 4 && distractions.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute text-xs md:text-sm font-bold text-white bg-rose-600 px-3 py-1 rounded-full shadow-lg z-10 whitespace-nowrap pointer-events-none border border-rose-400"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            {d.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 relative z-20">
        <Mic size={32} />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 relative z-20">{levelTitle}</h3>
      <p className="text-pink-200/70 mb-8 text-[10px] md:text-xs relative z-20 h-8">
        {levelDesc}
      </p>

      <div className="relative w-full h-12 bg-slate-800 rounded-full overflow-hidden mb-8 border border-white/10 z-20">
        {/* Dynamic target area */}
        <motion.div 
          animate={{ left: `${targetCenter - targetArea/2}%`, width: `${targetArea}%` }}
          transition={{ duration: level >= 3 ? 0.3 : 0 }}
          className="absolute top-0 bottom-0 bg-emerald-500/30 border-x-2 border-emerald-400"
        />
        <div
          className="absolute top-1 bottom-1 w-2 bg-white rounded-full shadow-[0_0_10px_white]"
          style={{ left: `calc(${position}% - 4px)` }}
        />
      </div>

      <div className="flex justify-center gap-4 mb-4 text-sm font-bold relative z-20">
        <span className="text-emerald-400">Başarılı: {hits}/{requiredHits}</span>
        <span className="text-rose-400">Hata: {misses}/{allowedMisses}</span>
      </div>

      <div className="h-8 mb-4 relative z-20 flex justify-center items-center">
        <AnimatePresence mode="popLayout">
          {showMessage === "hit" && (
            <motion.span 
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="text-emerald-400 font-bold block"
            >
              Mükemmel Nota! 🎵
            </motion.span>
          )}
          {showMessage === "miss" && (
            <motion.span 
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="text-rose-400 font-bold block"
            >
              Detone Oldun! ❌
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {!useMic && (
        <button
          onClick={initMic}
          className="mb-4 text-[10px] text-pink-300 underline hover:text-pink-200 relative z-20"
        >
          Mikrofonla Şarkı Söyle (İzin İster)
        </button>
      )}
      {useMic && (
        <div className="mb-4 h-2 w-full bg-slate-900 rounded-full overflow-hidden relative z-20">
          <div className="h-full bg-pink-500 transition-all duration-75" style={{ width: `${Math.min(100, micVolume)}%` }} />
        </div>
      )}

      <button
        onClick={() => handleSing(false)}
        disabled={isDone}
        className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-lg md:text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 relative z-20"
      >
        <Play size={24} />
        SÖYLE (Boşluk/Enter)
      </button>
    </div>
  );
}

