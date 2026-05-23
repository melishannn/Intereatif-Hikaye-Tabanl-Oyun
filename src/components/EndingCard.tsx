import React, { useRef, useCallback } from "react";
import { Character } from "../types";
import { User, Star, Crown, Heart, HeartPulse, Activity } from "lucide-react";

interface Stats {
  health: number;
  resilience: number;
  success: number;
  talent: number;
  lynchCount?: number;
  vocalMinigameCount?: number;
  danceMinigameCount?: number;
  avoidedReset?: boolean;
}

interface EndingCardProps {
  type: "WIN" | "LOSE";
  character: Character;
  playerName: string;
  score: number;
  fanCount: number;
  endingTitle: string;
  endingDesc?: string;
  stats: Stats;
  leaderboard: { name: string; score: number; status: string }[];
}

export const EndingCard: React.FC<EndingCardProps> = ({
  type,
  character,
  playerName,
  score,
  fanCount,
  endingTitle,
  endingDesc,
  stats,
  leaderboard,
}) => {
  const isWin = type === "WIN";
  const theme = isWin
    ? {
        border: "border-purple-500/50",
        bg: "from-purple-900/40 to-indigo-900/40",
        accent: "text-purple-400",
        barBg: "bg-purple-900/50",
        barFill: "bg-gradient-to-r from-purple-500 to-indigo-400",
        glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]",
        iconBox: "bg-purple-500/20",
        textGradient: "from-purple-300 to-indigo-200",
      }
    : {
        border: "border-red-500/50",
        bg: "from-red-950/80 to-rose-950/80",
        accent: "text-red-500",
        barBg: "bg-red-950/50",
        barFill: "bg-gradient-to-r from-red-600 to-rose-500",
        glow: "shadow-[0_0_30px_rgba(225,29,72,0.3)]",
        iconBox: "bg-red-500/20",
        textGradient: "from-red-400 to-rose-200",
      };

  const traitList = character.physicalTrait
    ?.split(",")
    .map((t) => t.trim()) || [character.trait];

  return (
    <div
      id="ending-card"
      className={`relative w-full max-w-4xl mx-auto rounded-[2rem] border overflow-hidden flex flex-col md:flex-row bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow} text-white font-sans`}
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Background grain/texture effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* Left side: Character image & details */}
      <div className="relative w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-end min-h-[350px] md:min-h-[500px]">
        {/* Character Image */}
        {character.imageUrl && (
          <div className="absolute inset-2 bottom-0 md:inset-4 rounded-t-[1.5rem] md:rounded-[1.5rem] overflow-hidden -z-10 bg-slate-900 border border-white/5">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover opacity-90"
              crossOrigin="anonymous"
            />
            {/* Dark gradient overlay for text readability */}
            <div
              className={`absolute inset-0 bg-gradient-to-t space-y-0 ${isWin ? "from-indigo-950/90 via-purple-900/40 to-transparent" : "from-red-950/90 via-red-900/40 to-transparent"} mix-blend-multiply`}
            ></div>
            <div
              className={`absolute inset-0 bg-gradient-to-t ${isWin ? "from-black via-black/20" : "from-black/95 via-black/40"} to-transparent`}
            ></div>
          </div>
        )}

        {/* Top-left Icon */}
        <div
          className={`absolute top-6 left-6 md:top-8 md:left-8 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-lg ${theme.iconBox}`}
        >
          {isWin ? (
            <Crown className="text-white w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <Heart className="text-white w-5 h-5 md:w-6 md:h-6" />
          )}
        </div>

        {/* Left Side Content */}
        <div className="relative z-10 px-2 md:px-4 pb-2 md:pb-2 flex flex-col items-center md:items-start text-center md:text-left mt-24 md:mt-0">
          <h2 className="text-3xl md:text-5xl font-serif tracking-wider font-bold uppercase mb-1 drop-shadow-lg">
            {playerName}
          </h2>
          <div
            className={`text-xs md:text-sm tracking-widest uppercase mb-3 md:mb-4 font-semibold ${isWin ? "text-indigo-300" : "text-rose-300"}`}
          >
            {character.name}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6 w-full">
            {traitList.map((trait, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-semibold border border-white/20 uppercase tracking-wider text-white/90 shadow-sm"
              >
                {trait}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-4 md:p-5 border border-white/20 w-full mb-2 md:mb-0">
            <div className="flex items-center gap-2 md:gap-3">
              <User className="w-5 h-5 opacity-90 text-white" />
              <span className="text-xs md:text-sm uppercase tracking-widest font-semibold text-white/90">
                Takipçiler
              </span>
            </div>
            <div className="flex items-end gap-1 md:gap-2">
              <span className="text-xl md:text-2xl font-bold font-mono text-white">
                {fanCount.toLocaleString()}
              </span>
              <span
                className={`text-[10px] md:text-xs ml-1 md:ml-2 font-mono font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}
              >
                {isWin ? "+" : ""}
                {Math.floor(score * 10).toLocaleString()}{" "}
                <Activity className="inline w-3 h-3 mb-1" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Stats */}
      <div className="relative w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-between bg-black/20 md:bg-transparent rounded-b-[1.5rem] md:rounded-none">
        <div className="text-center mb-3 md:mb-4">
          {/* WIN / LOSE Title */}
          <div className="relative inline-block mb-1 md:mb-2">
            {isWin && (
              <Crown className="absolute -top-5 md:-top-6 left-1/2 transform -translate-x-1/2 w-5 h-5 md:w-6 md:h-6 text-purple-400 opacity-80" />
            )}
            <h1
              className={`text-3xl md:text-5xl font-serif font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-b ${theme.textGradient}`}
            >
              {type}
            </h1>
          </div>
          <div className="text-[10px] md:text-sm tracking-[0.2em] font-semibold uppercase text-white/80 mb-2">
            {endingTitle}
          </div>
          {endingDesc && (
            <div className="text-[10px] md:text-xs text-white/60 italic px-2">
              "{endingDesc}"
            </div>
          )}
        </div>

        {/* Status Bars */}
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-4">
          <StatBar
            icon={<HeartPulse size={16} />}
            label="SAĞLIK"
            value={stats.health}
            theme={theme}
          />
          <StatBar
            icon={<Crown size={16} />}
            label="PSİKOLOJİ"
            value={stats.resilience}
            theme={theme}
          />
          <StatBar
            icon={<Activity size={16} />}
            label="BAŞARI"
            value={stats.success}
            theme={theme}
          />
          <StatBar
            icon={<Star size={16} />}
            label="YETENEK"
            value={stats.talent}
            theme={theme}
          />
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px] md:text-xs text-white/60 mb-2">
            <div className="bg-white/5 rounded-lg p-2">Linç: {stats.lynchCount || 0}</div>
            <div className="bg-white/5 rounded-lg p-2">Vokal: {stats.vocalMinigameCount || 0}</div>
            <div className="bg-white/5 rounded-lg p-2">Dans: {stats.danceMinigameCount || 0}</div>
            <div className="bg-white/5 rounded-lg p-2">Reset: {stats.avoidedReset ? "Yok" : "Var"}</div>
        </div>

        {/* Score blocks */}
        <div>
          <div className="text-[10px] md:text-xs text-center text-white/50 tracking-widest mb-2 md:mb-3 uppercase">
            {isWin ? "KAZANÇ" : "KAYIP"}
          </div>
          <div className="flex justify-between gap-2 md:gap-4 mb-4">
            <ScoreBox
              icon={<Star size={18} />}
              value={
                isWin
                  ? `+${Math.floor(score / 10)}`
                  : `-${Math.floor(score / 20)}`
              }
              theme={theme}
            />
            <ScoreBox
              icon={<User size={18} />}
              value={
                isWin
                  ? `+${(fanCount / 1000).toFixed(1)}K`
                  : `-${Math.floor((stats.health + stats.resilience) * 10)}`
              }
              theme={theme}
            />
            <ScoreBox
              icon={<Crown size={18} />}
              value={
                isWin
                  ? `+${Math.floor(stats.success)}`
                  : `-${Math.floor(100 - stats.success)}`
              }
              theme={theme}
            />
          </div>
          
          {/* Full Leaderboard (Hidden on mobile) */}
          <div className="hidden md:block mt-4 bg-black/30 rounded-xl p-3 max-h-40 overflow-y-auto">
            <div className="text-[10px] uppercase text-white/50 mb-2">Liderlik Tablosu</div>
            <div className="flex flex-col gap-1">
                {leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-1">
                        <span>{entry.name}</span>
                        <span className="text-amber-400">{entry.score}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ icon, label, value, theme }: any) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-1.5 md:gap-2 text-white/80 text-[10px] md:text-xs font-semibold tracking-wider">
        {icon}
        {label}
      </div>
      <span className="text-[10px] md:text-xs font-mono opacity-80">
        {Math.floor(value)}%
      </span>
    </div>
    <div
      className={`h-1.5 md:h-2 w-full rounded-full ${theme.barBg} overflow-hidden`}
    >
      <div
        className={`h-full ${theme.barFill} rounded-full`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const ScoreBox = ({ icon, value, theme }: any) => (
  <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
    <div className={`${theme.accent} opacity-80`}>{icon}</div>
    <div className="font-mono text-sm">{value}</div>
  </div>
);
