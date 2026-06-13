import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ALL_MOVES = ["UP", "DOWN", "LEFT", "RIGHT"];
const L1_MOVES = ["LEFT", "RIGHT"];

const LYNCH_COMMENTS = [
  "Robot gibi dans ediyorsun!",
  "Bu ne biçim koreografi?",
  "Sahneye hiç yakışmıyorsun!",
  "Gözlerim kanadı...",
];

type Note = {
  id: number;
  dir: string;
  y: number;
  hit: boolean;
};

const LEVEL_THEMES: Record<number, { color: string; bg: string; accent: string; ripple: string }> = {
  1: { color: "text-blue-400", bg: "bg-blue-500/20", accent: "border-blue-500/30", ripple: "bg-blue-500/10" },
  2: { color: "text-purple-400", bg: "bg-purple-500/20", accent: "border-purple-500/30", ripple: "bg-purple-500/10" },
  3: { color: "text-amber-400", bg: "bg-amber-500/20", accent: "border-amber-500/30", ripple: "bg-amber-500/10" },
  4: { color: "text-rose-400", bg: "bg-rose-500/20", accent: "border-rose-500/30", ripple: "bg-rose-500/10" }
};

export function DanceMinigame({
  onComplete,
  level = 1,
}: {
  onComplete: (success: boolean) => void;
  level?: number;
}) {
  const isSimonSays = level === 3;
  const theme = LEVEL_THEMES[level] || LEVEL_THEMES[1];

  // SIMON SAYS STATE (L3)
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<"showing" | "playing" | "success" | "fail">("showing");
  const [activeDisplay, setActiveDisplay] = useState(-1);

  // DDR STATE (L1, L2, L4)
  const [notes, setNotes] = useState<Note[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ddrStatus, setDdrStatus] = useState<"playing" | "success" | "fail">("playing");
  const requestRef = useRef<number | undefined>(undefined);
  const lastNoteTime = useRef<number>(0);
  const [distractions, setDistractions] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // DDR Params
  const noteSpeed = level === 1 ? 0.7 : level === 2 ? 1.0 : 1.4;
  const spawnRate = level === 1 ? 1600 : level === 2 ? 1200 : 850;
  const targetHits = level === 1 ? 5 : level === 2 ? 8 : 12;
  const allowedMisses = 4;

  // Level info
  const levelTitle = 
    level === 1 ? "Level 1: Temel Adımlar" : 
    level === 2 ? "Level 2: K-Pop Koreografisi" : 
    level === 3 ? "Level 3: Modern Dans (Ezber)" : 
    "Level 4: Global Sahne Şovu";

  const levelDesc = 
    level === 1 ? "Ritmi yakala. Sadece Sol ve Sağ oklar!" :
    level === 2 ? "Tempo yükseliyor. Hazır ol!" :
    level === 3 ? "Koreografiyi hatırla!" :
    "Tüm dünya seni izliyor. Kusursuz ol!";

  // SIMON SAYS LOGIC
  useEffect(() => {
    if (isSimonSays && status === "showing" && sequence.length === 0) {
      setSequence(Array.from({ length: 5 }, () => ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)]));
    }
  }, [isSimonSays, status, sequence]);

  useEffect(() => {
    if (isSimonSays && status === "showing" && sequence.length > 0) {
      sequence.forEach((_, i) => setTimeout(() => setActiveDisplay(i), i * 700 + 400));
      setTimeout(() => { setActiveDisplay(-1); setStatus("playing"); }, sequence.length * 700 + 400);
    }
  }, [isSimonSays, sequence, status]);

  const handleSimonPress = (dir: string) => {
    if (status !== "playing") return;
    const nextIndex = playerSequence.length;
    if (sequence[nextIndex] === dir) {
      const newPlayerSeq = [...playerSequence, dir];
      setPlayerSequence(newPlayerSeq);
      if (newPlayerSeq.length === sequence.length) {
        setStatus("success");
        setTimeout(() => onComplete(true), 1500);
      }
    } else {
      setStatus("fail");
      setTimeout(() => onComplete(false), 1500);
    }
  };

  // DDR LOGIC
  useEffect(() => {
    if (isSimonSays || ddrStatus !== "playing") return;

    let isRunning = true;
    const updateDDR = () => {
      if (!isRunning) return;
      const now = Date.now();
      
      if (now - lastNoteTime.current > spawnRate && hits + notes.length < targetHits) {
        lastNoteTime.current = now;
        const availableMoves = level === 1 ? L1_MOVES : ALL_MOVES;
        setNotes(prev => [...prev, { id: Date.now(), dir: availableMoves[Math.floor(Math.random() * availableMoves.length)], y: -10, hit: false }]);
      }

      setNotes(prev => {
        let newMisses = misses;
        const updated = prev.map(n => ({ ...n, y: n.y + noteSpeed })).filter(n => {
          if (n.y > 105 && !n.hit) {
            newMisses++; 
            setCombo(0);
            return false;
          }
          return !n.hit;
        });

        if (newMisses > misses) setMisses(newMisses);
        if (newMisses >= allowedMisses) {
          setDdrStatus("fail");
          setTimeout(() => onComplete(false), 1500);
        }
        return updated;
      });

      requestRef.current = requestAnimationFrame(updateDDR);
    };

    requestRef.current = requestAnimationFrame(updateDDR);
    return () => { isRunning = false; if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isSimonSays, ddrStatus, hits, misses, notes.length, level, spawnRate, noteSpeed, targetHits]);

  const handleDDRPress = (dir: string) => {
    if (ddrStatus !== "playing") return;
    setNotes((prev) => {
      let found = false;
      let newHits = hits;
      const updated = prev.map((note) => {
        if (!found && note.dir === dir && note.y >= 70 && note.y <= 98 && !note.hit) {
          found = true; newHits++; return { ...note, hit: true };
        }
        return note;
      });

      if (found) {
        setHits(newHits);
        setCombo(prev => prev + 1);
        if (newHits >= targetHits) {
          setDdrStatus("success"); setTimeout(() => onComplete(true), 1500);
        }
      } else {
        setCombo(0);
      }
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dir = "";
      switch (e.key) {
        case "ArrowUp": case "w": case "W": dir = "UP"; break;
        case "ArrowDown": case "s": case "S": dir = "DOWN"; break;
        case "ArrowLeft": case "a": case "A": dir = "LEFT"; break;
        case "ArrowRight": case "d": case "D": dir = "RIGHT"; break;
      }
      if (!dir) return;
      if (isSimonSays) handleSimonPress(dir); else handleDDRPress(dir);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, ddrStatus, playerSequence, sequence, hits]);

  // L4 Distractions
  useEffect(() => {
    if (isSimonSays || level < 4 || ddrStatus !== "playing") return;
    const interval = setInterval(() => {
      setDistractions(prev => [...prev.slice(-3), { id: Date.now(), text: LYNCH_COMMENTS[Math.floor(Math.random() * LYNCH_COMMENTS.length)], x: Math.random() * 60, y: Math.random() * 80 }]);
    }, 1500);
    return () => clearInterval(interval);
  }, [level, isSimonSays, ddrStatus]);

  const getArrowIcon = (dir: string, highlight: boolean = false) => {
    const size = highlight ? 42 : 28;
    const color = highlight ? theme.color : "text-white";
    switch (dir) {
      case "UP": return <ArrowUp size={size} className={color} />;
      case "DOWN": return <ArrowDown size={size} className={color} />;
      case "LEFT": return <ArrowLeft size={size} className={color} />;
      case "RIGHT": return <ArrowRight size={size} className={color} />;
      default: return null;
    }
  };

  return (
    <div className={`bg-slate-950 p-6 md:p-8 rounded-3xl border ${theme.accent} text-center w-full max-w-md mx-auto shadow-2xl select-none relative overflow-hidden`}>
      <div className={`absolute inset-0 ${theme.ripple} opacity-10`} />
      
      <AnimatePresence>
        {level === 4 && distractions.map(d => (
          <motion.div key={d.id} className="absolute text-[10px] font-bold text-white bg-rose-600 px-3 py-1 rounded-full shadow-lg z-30 pointer-events-none" style={{ left: `${d.x}%`, top: `${d.y}%` }}>{d.text}</motion.div>
        ))}
      </AnimatePresence>

      <div className={`w-14 h-14 ${theme.bg} ${theme.color} rounded-full flex items-center justify-center mx-auto mb-3 relative z-20 border border-white/5`}>
        <Activity size={28} />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-1 relative z-20">{levelTitle}</h3>
      <p className="text-white/40 mb-4 text-[10px] md:text-xs relative z-20 h-4">{levelDesc}</p>

      {isSimonSays ? (
        <div className="h-24 bg-slate-900/60 border border-white/5 rounded-2xl mb-6 flex flex-col items-center justify-center relative overflow-hidden">
          {status === "showing" ? (activeDisplay >= 0 ? <motion.div animate={{ scale: [1, 1.2, 1] }}>{getArrowIcon(sequence[activeDisplay], true)}</motion.div> : <span className="text-white/20 animate-pulse text-xs">HAZIRLAN...</span>)
           : status === "fail" ? <span className="text-rose-500 font-black">HATA! ❌</span>
           : status === "success" ? <span className="text-emerald-500 font-black">KUSURSUZ! ✨</span>
           : <div className="flex gap-2">{playerSequence.map((dir, i) => <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="bg-white/5 p-1.5 rounded-lg">{getArrowIcon(dir)}</motion.div>)}</div>}
        </div>
      ) : (
        <>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
            <span className={theme.color}>Skor: {hits}/{targetHits}</span>
            <span className="text-rose-500">Combo: {combo}</span>
          </div>
          <div className="h-52 bg-slate-950/40 border border-white/5 rounded-2xl mb-6 relative overflow-hidden">
            <div className="absolute bottom-[2%] w-full h-[22%] bg-white/5 border-y border-white/10 flex items-center justify-center">
               <span className="text-[10px] text-white/10 font-black tracking-widest">HEDEF ALANI</span>
            </div>
            {ddrStatus === "success" && <div className="absolute inset-0 bg-emerald-950/90 flex items-center justify-center z-20"><span className="text-emerald-400 font-black">MÜKEMMEL SONUÇ! ✨</span></div>}
            {ddrStatus === "fail" && <div className="absolute inset-0 bg-rose-950/90 flex items-center justify-center z-20"><span className="text-rose-400 font-black">BAŞARISIZ! ❌</span></div>}
            <AnimatePresence>
            {notes.map(n => (
              <motion.div 
                key={n.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute w-full flex justify-center" 
                style={{ top: `${n.y}%` }}
              >
                <div className="bg-slate-900 p-2 rounded-full border border-white/5 shadow-md">
                  {getArrowIcon(n.dir)}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-2 w-48 mx-auto relative z-20">
        <div />
        <button onClick={() => isSimonSays ? handleSimonPress("UP") : handleDDRPress("UP")} disabled={level === 1} className="bg-slate-900 text-white/80 p-3 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-slate-800 active:scale-90 transition-all disabled:opacity-10"><ArrowUp size={24} /></button>
        <div />
        <button onClick={() => isSimonSays ? handleSimonPress("LEFT") : handleDDRPress("LEFT")} className="bg-slate-900 text-white/80 p-3 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-slate-800 active:scale-90 transition-all"><ArrowLeft size={24} /></button>
        <button onClick={() => isSimonSays ? handleSimonPress("DOWN") : handleDDRPress("DOWN")} disabled={level === 1} className="bg-slate-900 text-white/80 p-3 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-slate-800 active:scale-90 transition-all disabled:opacity-10"><ArrowDown size={24} /></button>
        <button onClick={() => isSimonSays ? handleSimonPress("RIGHT") : handleDDRPress("RIGHT")} className="bg-slate-900 text-white/80 p-3 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-slate-800 active:scale-90 transition-all"><ArrowRight size={24} /></button>
      </div>
    </div>
  );
}
