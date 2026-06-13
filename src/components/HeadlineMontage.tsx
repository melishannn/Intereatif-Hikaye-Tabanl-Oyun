import React, { useState, useEffect } from "react";
import { Newspaper, TrendingUp, AlertCircle, Heart } from "lucide-react";

interface Headline {
  id: number;
  text: string;
  type: "success" | "warning" | "scandal" | "neutral";
}

export function HeadlineMontage({ 
  stats, 
  level,
  playerName,
  avatarUrl
}: { 
  stats: { health: number; resilience: number; success: number; talent: number; fans: number; lynchCount: number };
  level: number;
  playerName: string;
  avatarUrl?: string;
}) {
  const [headlines, setHeadlines] = useState<Headline[]>([]);

  useEffect(() => {
    const generated: Headline[] = [];
    
    // Success Headlines
    if (stats.success > 70) {
      generated.push({ id: 1, text: `${playerName} Rüzgarı! ${stats.fans.toLocaleString()} HAYRAN SAYISINA ULAŞILDI!`, type: "success" });
      generated.push({ id: 2, text: `ELEŞTİRMENLER ${playerName}'İ KONUŞUYOR: YENİ STAR MI DOĞUYOR?`, type: "success" });
    } else {
      generated.push({ id: 3, text: `${playerName} SAHNEDE BEKLENTİLERİN ALTINDA KALDI...`, type: "neutral" });
    }

    // Health/Mind Headlines
    if (stats.health < 30) {
      generated.push({ id: 4, text: `SAĞLIK ALARMI: ${playerName} SAHNEDE ZOR ANLAR YAŞADI!`, type: "warning" });
    }
    if (stats.resilience < 30) {
      generated.push({ id: 5, text: `MENAJERLİK ŞİRKETİNDEN ${playerName} AÇIKLAMASI: 'DİNLENMEYE İHTİYACI VAR'`, type: "warning" });
    }

    // Lynch/Scandal Headlines
    if (stats.lynchCount > 2) {
      generated.push({ id: 6, text: `SKANDAL İDDİALAR! SOSYAL MEDYA ${playerName}'İ LİNÇLİYOR.`, type: "scandal" });
    }

    // Default Fame Headline
    generated.push({ id: 7, text: `${playerName} ${stats.fans > 50000 ? 'KÜRESEL' : 'YEREL'} LİSTELERDE YÜKSELİŞTE!`, type: "success" });

    // Deduplicate and take top 5
    const unique = Array.from(new Map(generated.map(item => [item.text, item])).values());
    setHeadlines(unique.slice(0, 5));
  }, [stats, level, playerName]);

  if (headlines.length === 0) return (
    <div className="text-center text-slate-500 mt-10">Henüz haber kaydı yok...</div>
  );

  const getBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-600/20 border-emerald-500/50 text-emerald-100";
      case "warning": return "bg-amber-600/20 border-amber-500/50 text-amber-100";
      case "scandal": return "bg-rose-600/20 border-rose-500/50 text-rose-100";
      default: return "bg-slate-700/20 border-slate-500/50 text-slate-100";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-600";
      case "warning": return "bg-amber-600";
      case "scandal": return "bg-rose-600";
      default: return "bg-slate-600";
    }
  };

  return (
    <div className="space-y-4">
      {headlines.map((item) => (
        <div key={item.id} className={`p-4 rounded-2xl border ${getBgColor(item.type)} relative overflow-hidden backdrop-blur-md`}>
          <div className="flex items-start gap-4">
            {avatarUrl && (
               <img src={avatarUrl} alt="İdol" className="w-12 h-12 rounded-lg object-cover border border-white/20 shadow-md shrink-0 bg-slate-800" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white ${getBadgeColor(item.type)}`}>
                  {item.type === 'scandal' ? 'SON DAKİKA' : 'MAGAZİN'}
                </span>
                <span className="text-[10px] opacity-60">DAILY STAR NEWS</span>
              </div>
              <h3 className="font-serif italic font-bold text-sm md:text-md leading-snug">"{item.text}"</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
