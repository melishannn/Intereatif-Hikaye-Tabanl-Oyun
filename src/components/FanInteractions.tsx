import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Sparkles, Heart } from "lucide-react";

interface FanGift {
  id: number;
  name: string;
  desc: string;
  image: string;
  reward: { type: string; value: number };
}

const GIFTS: FanGift[] = [
  { id: 1, name: "Bitki Çayı Paketi", desc: "Ses tellerini yumuşatır ve yorgunluğunu alır.", image: "/images/gifts/cayi.png", reward: { type: "health", value: 15 } },
  { id: 2, name: "Özel Tasarım Ayakkabı", desc: "Dans ederken adımlarını daha hafif hissettirir.", image: "/images/gifts/ayakkabi.png", reward: { type: "talent", value: 8 } },
  { id: 3, name: "Fan Günlüğü", desc: "Binlerce hayranın senin için yazdığı mesajlar.", image: "/images/gifts/gunluk.png", reward: { type: "resilience", value: 12 } },
  { id: 4, name: "Altın Mikrofon", desc: "Ses performansını bir üst seviyeye taşır.", image: "/images/gifts/mikrofon.png", reward: { type: "success", value: 10 } },
];

export function FanInteractions({ 
  playerName,
  avatarUrl,
  onComplete 
}: { 
  playerName: string;
  avatarUrl?: string;
  onComplete: (reward: { type: string; value: number } | null) => void 
}) {
  const [step, setStep] = useState<"intro" | "letter" | "gift" | "reward">("intro");
  const [selectedGift, setSelectedGift] = useState<FanGift | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-slate-900 border border-pink-500/20 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Heart size={200} className="text-pink-500" />
        </div>

        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4 italic">KULİS KAPISI ÇALDI!</h2>
              <p className="text-slate-400 mb-8">
                Performansından sonra hayranların sana ulaştırmak istediği bir mektup ve bazı hediyeler var.
              </p>
              <button 
                onClick={() => setStep("letter")}
                className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold transition-all shadow-lg"
              >
                Mektubu Oku
              </button>
            </motion.div>
          )}

          {step === "letter" && (
            <motion.div 
              key="letter"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -50 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transform -rotate-1 relative"
            >
              <div className="absolute -top-4 -right-4 p-4 text-pink-500 bg-white rounded-full shadow-lg">
                <Heart fill="currentColor" size={24} />
              </div>
              {avatarUrl && (
                <div className="flex justify-center mb-4">
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-pink-200" />
                </div>
              )}
              <h3 className="font-bold text-pink-500 text-center mb-4 uppercase tracking-widest">{playerName}'E SEVGİLERLE</h3>
              <p className="font-serif text-slate-800 text-lg leading-relaxed italic mb-6">
                "Sevgili {playerName},<br/><br/>
                Seni sahnede izlemek adeta bir rüya gibiydi. Her hareketin, her notan bize umut veriyor. Yorgun olduğunu biliyoruz ama unutma, binlerce kalp senin için atıyor. <br/><br/>
                Lütfen kendine iyi bak. Seni her zaman destekleyeceğiz!<br/><br/>
                - Daima Seninle Olan Fanların"
              </p>
              <button 
                onClick={() => setStep("gift")}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Hediyelere Bak
              </button>
            </motion.div>
          )}

          {step === "gift" && (
            <motion.div 
              key="gift"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">Hediye Seç</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {GIFTS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setSelectedGift(g); setStep("reward"); }}
                    className="bg-slate-800 p-6 rounded-2xl border border-white/5 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all text-center flex flex-col items-center group relative overflow-hidden"
                  >
                    <div className="w-16 h-16 mb-3 rounded-xl bg-slate-700/50 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                      <img 
                        src={g.image} 
                        alt={g.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                          target.className = "w-8 h-8 opacity-50"; 
                        }}
                      />
                    </div>
                    <div className="text-white text-xs font-bold">{g.name}</div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sadece birini seçebilirsin</p>
            </motion.div>
          )}

          {step === "reward" && selectedGift && (
            <motion.div 
              key="reward"
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={48} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 uppercase">{selectedGift.name} ALINDI!</h2>
              <p className="text-slate-400 mb-8">{selectedGift.desc}</p>
              <div className="bg-emerald-500/20 text-emerald-400 py-3 rounded-xl font-black mb-8 border border-emerald-500/30">
                +{selectedGift.reward.value} {selectedGift.reward.type.toUpperCase()}
              </div>
              <button 
                onClick={() => onComplete(selectedGift.reward)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg"
              >
                Sahneye Dön
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

