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

export function DanceMinigame({
  onComplete,
  level = 1,
}: {
  onComplete: (success: boolean) => void;
  level?: number;
}) {
  const isSimonSays = level === 3;

  // SIMON SAYS STATE (L3)
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<"showing" | "playing" | "success" | "fail">("showing");
  const [activeDisplay, setActiveDisplay] = useState(-1);

  // DDR STATE (L1, L2, L4)
  const [notes, setNotes] = useState<Note[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [ddrStatus, setDdrStatus] = useState<"playing" | "success" | "fail">("playing");
  const requestRef = useRef<number | undefined>(undefined);
  const lastNoteTime = useRef<number>(0);
  const [distractions, setDistractions] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // DDR Params
  const noteSpeed = level === 1 ? 0.8 : level === 2 ? 1.2 : 1.8;
  const spawnRate = level === 1 ? 1500 : level === 2 ? 1000 : 700;
  const targetHits = level === 1 ? 6 : level === 2 ? 10 : 15;
  const allowedMisses = 3;

  // Level info
  const levelTitle = 
    level === 1 ? "Level 1: Temel Adımlar" : 
    level === 2 ? "Level 2: 4 Yön Kombosu" : 
    level === 3 ? "Level 3: Koreografi Ezber" : 
    "Level 4: Kaos Sahnesi";

  const levelDesc = 
    level === 1 ? "Aşağı düşen oklara (Sadece Sol/Sağ) hedef alanda bas." :
    level === 2 ? "Tüm oklar devrede. Hız arttı!" :
    level === 3 ? "Gösterilen 5 adımlık sırayı ezberle ve tekrarla." :
    "Hızlı notalar, sahne ışıkları ve seyirci yorumları! Odaklan!";

  // SIMON SAYS LOGIC
  useEffect(() => {
    if (isSimonSays && status === "showing" && sequence.length === 0) {
      setSequence(Array.from({ length: 5 }, () => ALL_MOVES[Math.floor(Math.random() * ALL_MOVES.length)]));
    }
  }, [isSimonSays, status, sequence]);

  useEffect(() => {
    if (isSimonSays && status === "showing" && sequence.length > 0) {
      sequence.forEach((_, i) => setTimeout(() => setActiveDisplay(i), i * 800 + 500));
      setTimeout(() => { setActiveDisplay(-1); setStatus("playing"); }, sequence.length * 800 + 500);
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
          if (n.y > 100 && !n.hit) {
            newMisses++; return false;
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
  }, [isSimonSays, ddrStatus, hits, misses, notes.length, level]);

  const handleDDRPress = (dir: string) => {
    if (ddrStatus !== "playing") return;
    setNotes((prev) => {
      let found = false;
      let newHits = hits;
      const updated = prev.map((note) => {
        if (!found && note.dir === dir && note.y >= 70 && note.y <= 95 && !note.hit) {
          found = true; newHits++; return { ...note, hit: true };
        }
        return note;
      });

      if (found) {
        setHits(newHits);
        if (newHits >= targetHits) {
          setDdrStatus("success"); setTimeout(() => onComplete(true), 1500);
        }
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
    const size = highlight ? 48 : 32;
    const color = highlight ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" : "text-white";
    switch (dir) {
      case "UP": return <ArrowUp size={size} className={color} />;
      case "DOWN": return <ArrowDown size={size} className={color} />;
      case "LEFT": return <ArrowLeft size={size} className={color} />;
      case "RIGHT": return <ArrowRight size={size} className={color} />;
      default: return null;
    }
  };

  return (
    <div className={`bg-slate-950 p-6 md:p-8 rounded-3xl border border-emerald-500/30 text-center w-full max-w-md mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)] select-none relative overflow-hidden ${level === 4 && ddrStatus === "playing" ? "animate-pulse" : ""}`}>
      <AnimatePresence>
        {level === 4 && distractions.map(d => (
          <motion.div key={d.id} className="absolute text-[10px] md:text-sm font-bold text-slate-900 bg-emerald-400 px-3 py-1 rounded-full shadow-lg z-30 pointer-events-none" style={{ left: `${d.x}%`, top: `${d.y}%` }}>{d.text}</motion.div>
        ))}
      </AnimatePresence>

      <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 relative z-20">
        <Activity size={32} />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 relative z-20">{levelTitle}</h3>
      <p className="text-emerald-200/70 mb-4 text-[10px] md:text-xs relative z-20 h-8">{levelDesc}</p>

      {isSimonSays ? (
        <div className="h-20 bg-slate-900 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
          {status === "showing" ? (activeDisplay >= 0 ? <div className="animate-ping-once">{getArrowIcon(sequence[activeDisplay], true)}</div> : <span className="text-slate-500">Ezberle...</span>)
           : status === "fail" ? <span className="text-rose-500 font-bold">AYAKLARIN DOLANDI! ❌</span>
           : status === "success" ? <span className="text-emerald-500 font-bold">MÜKEMMEL! ✨</span>
           : <div className="flex gap-2">{playerSequence.map((dir, i) => <div key={i} className="bg-emerald-900/30 p-2 rounded-lg">{getArrowIcon(dir)}</div>)}</div>}
        </div>
      ) : (
        <>
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-emerald-400">Skor: {hits}/{targetHits}</span>
            <span className="text-rose-400">Hata: {misses}/{allowedMisses}</span>
          </div>
          <div className="h-48 bg-slate-900 rounded-xl mb-6 relative overflow-hidden">
            <div className="absolute bottom-[5%] w-full h-[25%] bg-emerald-500/10 border-y border-emerald-500/30 flex flex-col justify-end items-center pb-1"><span className="text-[10px] text-emerald-500/50 font-bold">HEDEF</span></div>
            {ddrStatus === "success" && <div className="absolute inset-0 bg-emerald-900/80 flex items-center justify-center z-20"><span className="text-emerald-400 font-bold">MÜKEMMEL! ✨</span></div>}
            {ddrStatus === "fail" && <div className="absolute inset-0 bg-rose-900/80 flex items-center justify-center z-20"><span className="text-rose-400 font-bold">RİTİM KAÇTI! ❌</span></div>}
            {notes.map(n => <div key={n.id} className="absolute w-full flex justify-center" style={{ top: `${n.y}%` }}><div className="bg-slate-800 p-2 rounded-full border border-slate-600 shadow-lg">{getArrowIcon(n.dir)}</div></div>)}
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-2 w-48 mx-auto relative z-20">
        <div />
        <button onClick={() => isSimonSays ? handleSimonPress("UP") : handleDDRPress("UP")} disabled={level === 1} className="bg-slate-800 p-3 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600 disabled:opacity-30"><ArrowUp size={24} className="text-white" /></button>
        <div />
        <button onClick={() => isSimonSays ? handleSimonPress("LEFT") : handleDDRPress("LEFT")} className="bg-slate-800 p-3 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600"><ArrowLeft size={24} className="text-white" /></button>
        <button onClick={() => isSimonSays ? handleSimonPress("DOWN") : handleDDRPress("DOWN")} disabled={level === 1} className="bg-slate-800 p-3 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600 disabled:opacity-30"><ArrowDown size={24} className="text-white" /></button>
        <button onClick={() => isSimonSays ? handleSimonPress("RIGHT") : handleDDRPress("RIGHT")} className="bg-slate-800 p-3 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600"><ArrowRight size={24} className="text-white" /></button>
      </div>
    </div>
  );
}
