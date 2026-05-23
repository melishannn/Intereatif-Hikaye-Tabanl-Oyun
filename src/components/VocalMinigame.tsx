import React, { useState, useEffect } from "react";
import { Mic, Check, X, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function VocalMinigame({
  onComplete,
}: {
  onComplete: (success: boolean) => void;
}) {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showMessage, setShowMessage] = useState<"hit" | "miss" | null>(null);

  useEffect(() => {
    if (isDone) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
        let next = prev + direction * 5;
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
  }, [direction, isDone]);

  const handleSing = () => {
    if (isDone) return;
    if (position >= 40 && position <= 60) {
      setHits((h) => h + 1);
      setShowMessage("hit");
      if (hits + 1 >= 3) {
        setIsDone(true);
        setTimeout(() => onComplete(true), 1500);
      }
    } else {
      setMisses((m) => m + 1);
      setShowMessage("miss");
      if (misses + 1 >= 2) {
        setIsDone(true);
        setTimeout(() => onComplete(false), 1500);
      }
    }
    setTimeout(() => setShowMessage(null), 800);
  };

  return (
    <div className="bg-slate-950 p-8 rounded-3xl border border-pink-500/30 text-center w-full max-w-md mx-auto shadow-[0_0_50px_rgba(236,72,153,0.2)]">
      <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mic size={32} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Vokal Antrenmanı</h3>
      <p className="text-pink-200/70 mb-8 text-sm">
        Sesin yeşil alana geldiğinde "Söyle" butonuna bas. 3 kere tutturman
        lazım!
      </p>

      <div className="relative w-full h-12 bg-slate-800 rounded-full overflow-hidden mb-8 border border-white/10">
        <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-emerald-500/30 border-x-2 border-emerald-400"></div>
        <div
          className="absolute top-1 bottom-1 w-2 bg-white rounded-full shadow-[0_0_10px_white]"
          style={{ left: `calc(${position}% - 4px)` }}
        />
      </div>

      <div className="flex justify-center gap-4 mb-8 text-sm font-bold">
        <span className="text-emerald-400">Başarılı: {hits}/3</span>
        <span className="text-rose-400">Hata: {misses}/2</span>
      </div>

      <div className="h-8 mb-4">
        {showMessage === "hit" && (
          <span className="text-emerald-400 font-bold animate-bounce block">
            Mükemmel Nota! 🎵
          </span>
        )}
        {showMessage === "miss" && (
          <span className="text-rose-400 font-bold block">
            Detone Oldun! ❌
          </span>
        )}
      </div>

      <button
        onClick={handleSing}
        disabled={isDone}
        className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95"
      >
        SÖYLE
      </button>
    </div>
  );
}
