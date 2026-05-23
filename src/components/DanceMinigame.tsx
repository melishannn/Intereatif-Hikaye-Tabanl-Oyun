import React, { useState, useEffect } from "react";
import {
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const DANCE_MOVES = ["UP", "DOWN", "LEFT", "RIGHT"];

export function DanceMinigame({
  onComplete,
}: {
  onComplete: (success: boolean) => void;
}) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [status, setStatus] = useState<
    "showing" | "playing" | "success" | "fail"
  >("showing");

  useEffect(() => {
    generateSequence();
  }, [round]);

  const generateSequence = () => {
    setIsShowingSequence(true);
    setStatus("showing");
    const newSeq = Array.from(
      { length: round + 2 },
      () => DANCE_MOVES[Math.floor(Math.random() * DANCE_MOVES.length)],
    );
    setSequence(newSeq);
    setPlayerSequence([]);

    setTimeout(
      () => {
        setIsShowingSequence(false);
        setStatus("playing");
      },
      newSeq.length * 800 + 500,
    );
  };

  const handleArrowPress = (direction: string) => {
    if (status !== "playing") return;

    const nextIndex = playerSequence.length;
    if (sequence[nextIndex] === direction) {
      const newPlayerSeq = [...playerSequence, direction];
      setPlayerSequence(newPlayerSeq);

      if (newPlayerSeq.length === sequence.length) {
        setStatus("success");
        if (round === 3) {
          setTimeout(() => onComplete(true), 1500);
        } else {
          setTimeout(() => setRound((r) => r + 1), 1000);
        }
      }
    } else {
      setStatus("fail");
      setTimeout(() => onComplete(false), 1500);
    }
  };

  const getArrowIcon = (dir: string, highlight: boolean = false) => {
    const size = highlight ? 48 : 32;
    const color = highlight
      ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
      : "text-white";
    switch (dir) {
      case "UP":
        return <ArrowUp size={size} className={color} />;
      case "DOWN":
        return <ArrowDown size={size} className={color} />;
      case "LEFT":
        return <ArrowLeft size={size} className={color} />;
      case "RIGHT":
        return <ArrowRight size={size} className={color} />;
      default:
        return null;
    }
  };

  const [activeDisplay, setActiveDisplay] = useState(-1);

  useEffect(() => {
    if (status === "showing") {
      sequence.forEach((_, i) => {
        setTimeout(
          () => {
            setActiveDisplay(i);
          },
          i * 800 + 500,
        );
      });
      setTimeout(
        () => {
          setActiveDisplay(-1);
        },
        sequence.length * 800 + 500,
      );
    }
  }, [sequence, status]);

  return (
    <div className="bg-slate-950 p-8 rounded-3xl border border-emerald-500/30 text-center w-full max-w-md mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)] select-none">
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Activity size={32} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Koreografi Ezberi</h3>
      <p className="text-emerald-200/70 mb-6 text-sm">
        Gösterilen yönleri sırasıyla tekrarla. (3 Tur)
      </p>

      <div className="mb-4 text-emerald-400 font-bold">Tur: {round} / 3</div>

      <div className="h-24 bg-slate-900 rounded-xl mb-8 flex items-center justify-center border border-white/5 relative overflow-hidden">
        {status === "showing" ? (
          activeDisplay >= 0 ? (
            <div className="animate-ping-once transition-all">
              {getArrowIcon(sequence[activeDisplay], true)}
            </div>
          ) : (
            <span className="text-slate-500 text-sm">Hazırlan...</span>
          )
        ) : status === "fail" ? (
          <span className="text-rose-500 font-bold text-xl">
            AYAKLARIN BİRBİRİNE DOLANDI!❌
          </span>
        ) : status === "success" ? (
          <span className="text-emerald-500 font-bold text-xl">
            MÜKEMMEL HAREKET! ✨
          </span>
        ) : (
          <div className="flex gap-2">
            {playerSequence.map((dir, i) => (
              <div
                key={i}
                className="text-emerald-300 bg-emerald-900/30 p-2 rounded-lg"
              >
                {getArrowIcon(dir)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        <div />
        <button
          onClick={() => handleArrowPress("UP")}
          disabled={status !== "playing"}
          className="bg-slate-800 hover:bg-emerald-900/50 p-4 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600 transition-colors"
        >
          <ArrowUp size={24} className="text-white" />
        </button>
        <div />
        <button
          onClick={() => handleArrowPress("LEFT")}
          disabled={status !== "playing"}
          className="bg-slate-800 hover:bg-emerald-900/50 p-4 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600 transition-colors"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <button
          onClick={() => handleArrowPress("DOWN")}
          disabled={status !== "playing"}
          className="bg-slate-800 hover:bg-emerald-900/50 p-4 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600 transition-colors"
        >
          <ArrowDown size={24} className="text-white" />
        </button>
        <button
          onClick={() => handleArrowPress("RIGHT")}
          disabled={status !== "playing"}
          className="bg-slate-800 hover:bg-emerald-900/50 p-4 rounded-xl flex items-center justify-center border border-slate-700 active:bg-emerald-600 transition-colors"
        >
          <ArrowRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}
