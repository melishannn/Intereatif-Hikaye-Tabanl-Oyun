import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VocalMinigame } from "./components/VocalMinigame";
import { DanceMinigame } from "./components/DanceMinigame";

import {
  Heart,
  Activity,
  Star,
  Zap,
  Home,
  Users,
  Mic,
  Camera,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Youtube,
  Volume2,
  VolumeX,
  Type,
  Ruler,
  Smile,
  User,
  Share2,
  Vibrate,
  VibrateOff,
  Sparkles,
} from "lucide-react";
import {
  Stats,
  Character,
  LocationId,
  GameEvent,
  BookQuote,
  SocialComment,
} from "./types";
import {
  NAMES,
  GENDERS,
  HAIR_COLORS,
  CLOTHING_STYLES,
  VOCAL_TONES,
  DANCE_STYLES,
  PERSONALITY_TRAITS,
  PHYSICAL_TRAITS,
  HEIGHTS,
  BODY_TYPES,
  BOOK_QUOTES,
  LOCATIONS,
  COMMENT_TEMPLATES,
  MOCK_USERS,
  FAN_REPLY_ALTERNATIVES,
} from "./data";
import { LYNCH_REASONS } from "./data/lynchReasons";
import { randomItem } from "./lib/utils";
import { CinematicType } from "./data/cinematics";

import { db, auth } from "./firebase";
import { handleFirestoreError, OperationType } from "./firebaseUtils";
import { collection, onSnapshot, addDoc, query, orderBy, limit, serverTimestamp, where } from "firebase/firestore";

const CinematicPlayer = lazy(() => import("./components/CinematicPlayer"));

type GameState =
  | "START"
  | "CUSTOMIZE"
  | "HUB"
  | "EVENT"
  | "LYNCH"
  | "RESULT"
  | "GAMEOVER"
  | "WIN"
  | "SOCIAL_MEDIA"
  | "CINEMATIC"
  | "MINIGAME_VOCAL"
  | "MINIGAME_DANCE"
  | "LOCATION_VIEW";

// Endings Definition
const ENDINGS = {
  GROUP_MEMBER: {
    title: "TEBRİKLER!",
    desc: "Zorlu süreçlerden geçtin, yeteneğini kanıtladın ve artık bir sanatçısın! Gruptaki yerin hazır.",
  },
  SOLO_CAREER: {
    title: "SOLO KARİYER!",
    desc: "Gruptan ayrılıp solo kariyer yapmaya karar verdin. Kendi şarkılarını yazıp özgürce hayranlarına sesleneceksin.",
  },
  RETIREMENT: {
    title: "ERKEN EMEKLİLİK!",
    desc: "Yüksek başarının tadını çıkardın ancak bedenin daha fazla dayanamadı. Kendi yapım şirketini kurmaya çekildin.",
  },
  INFLUENCER: {
    title: "POPÜLER İNFLUENCER!",
    desc: "İdol grubu yerine sosyal medyanın en çok takip edilen influencerlarından biri olmayı seçtin.",
  },
  QUIET_RETIREMENT: {
    title: "SESSİZ SEDASIZ EMEKLİLİK",
    desc: "Ne büyük bir yıkım yaşadın ne de zirveye ulaştın. Sakince yorucu sektörden çekilip normal bir hayata döndün.",
  },
  FAN_PHENOMENON: {
    title: "HAYRAN FENOMENİ",
    desc: "Sektörün tepesine oynamadın ama seninle çok güçlü bağ kuran, küçük ve sadık bir kitle edindin. Onlar için bir efsanesin.",
  },
  SCANDAL_VICTIM: {
    title: "SKANDAL KURBANI",
    desc: "Psikolojin sınırdayken verdiğin tepki magazinlere düştü. Acımasız medya seni affetmedi, kariyerin bir gecede silindi.",
  },
  CONTRACT_PRISON: {
    title: "KONTRAT HAPSİ",
    desc: "Şirket senin popülerliğini bırakmadı ama bedenin ve zihnin tükendi. Altın kafeste mahsur kaldın ve sadece nefes alıyorsun.",
  },
  INTERNATIONAL: {
    title: "ULUSLARARASI STAR",
    desc: "Daha gruptayken kendini o kadar ispatladın ki, ünün sınırları aştı. Artık global bir fenomensin!",
  },
  LOSER_HEALTH: {
    title: "FİZİKSEL TÜKENİŞ",
    desc: "Bedenini o kadar zorladın ki, artık sahneye çıkacak gücün kalmadı. Sağlığını korumak için sektörden ayrılmak zorunda kaldın.",
  },
  LOSER_MIND: {
    title: "PSİKOLOJİK ÇÖKÜŞ",
    desc: "Sektörün acımasız baskısı, nefret yorumları ve devasa stres seni tüketti. Kendi zihin sağlığın için her şeyi bırakın.",
  },
  LOSER_SUCCESS: {
    title: "KARİYER CİNAYETİ",
    desc: "İmajını kurtaramadın, şirketler yatırım yapmayı kesti ve hayranların seni terk etti. Maalesef müzik dünyasında unutulup gittin.",
  },
  LOSER_TALENT: {
    title: "YETENEĞE VEDA",
    desc: "Kendini geliştiremedin ve sahnede ışığını kaybettin. Sektördeki yerini çalışkan çaylaklara kaptırıp sahnelerden silindin.",
  },
  LOSER_DEFAULT: {
    title: "OYUN BİTTİ",
    desc: "Sosyal medyanın ve müzik sektörünün nefes kesici hızında kayboldun. Ne yazık ki bu zorlu yolculuğa daha fazla dayanamadın...",
  },
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>("START");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(() => ({
    health: Math.floor(Math.random() * 31) + 70, // 70-100
    resilience: Math.floor(Math.random() * 41) + 50, // 50-90
    success: Math.floor(Math.random() * 21) + 10, // 10-30
    talent: Math.floor(Math.random() * 21) + 20, // 20-40 default
  }));
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [currentQuote, setCurrentQuote] = useState<BookQuote | null>(null);
  const [lynchReason, setLynchReason] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string>("");
  // const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false); // Removed
  // const [avatarStyle, setAvatarStyle] = useState("portrait"); // Removed
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tasksCompletedInLevel, setTasksCompletedInLevel] = useState(0);
  const [level, setLevel] = useState(1);
  const [fanGifts, setFanGifts] = useState<{name: string, icon: string}[]>([]);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letters, setLetters] = useState<{text: string, user: string}[]>([]);
  const [socialComments, setSocialComments] = useState<SocialComment[]>([]);
  const [activeLynchComments, setActiveLynchComments] = useState<
    { id: number; text: string; x: number; y: number; scale: number }[]
  >([]);
  const [stageFails, setStageFails] = useState<{
    health: number;
    resilience: number;
    success: number;
    talent: number;
  }>({ health: 0, resilience: 0, success: 0, talent: 0 });
  const [usedEventIds, setUsedEventIds] = useState<string[]>([]);
  const [gameOverReason, setGameOverReason] = useState<
    "health" | "resilience" | "success" | null
  >(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [showWarning, setShowWarning] = useState<string | null>(null);
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [score, setScore] = useState(0);
  const [fanCount, setFanCount] = useState(0);
  const fanCountRef = useRef(0);
  const setFanCountSafe = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setFanCount((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const clamped = Math.max(0, next);
        fanCountRef.current = clamped;
        return clamped;
      });
    },
    [],
  );

  const [leaderboard, setLeaderboard] = useState<
    { name: string; score: number; status: string }[]
  >([]);
  const [winEnding, setWinEnding] =
    useState<keyof typeof ENDINGS>("GROUP_MEMBER");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [lynchCount, setLynchCount] = useState(0);
  const [lynchInteractions, setLynchInteractions] = useState(0);
  const [currentCinematic, setCurrentCinematic] = useState<CinematicType | null>(null);
  const [postCinematicCallback, setPostCinematicCallback] = useState<(() => void) | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio();
    a.volume = 0;
    return a;
  });

  // FIX 1: useRef ile score'u stale closure'dan koruyoruz
  const scoreRef = useRef(0);

  const playCinematic = useCallback((type: CinematicType, callback: () => void) => {
    setCurrentCinematic(type);
    setPostCinematicCallback(() => callback);
    setGameState("CINEMATIC");
  }, []);

  const setScoreSafe = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setScore((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const clamped = Math.max(0, next);
        scoreRef.current = clamped;
        return clamped;
      });
    },
    [],
  );

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "leaderboard"), where("score", ">=", 0), orderBy("score", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const board = snapshot.docs.map((doc) => ({
        name: doc.data().name as string,
        score: doc.data().score as number,
        status: doc.data().status as string,
      }));
      setLeaderboard(board);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "leaderboard");
    });
    return () => unsubscribe();
  }, []);

  const toggleLike = (id: string) => {
    setFanCountSafe((prev) => prev + 10);
    setSocialComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? (c.likes || 1) - 1 : (c.likes || 0) + 1 } : c)),
    );
  };

  const handleReply = (id: string, isPositive: boolean) => {
    setFanCountSafe((prev) => prev + (isPositive ? 30 : 10));
    setSocialComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              replied: true,
              fanReply: randomItem(FAN_REPLY_ALTERNATIVES),
            }
          : c,
      ),
    );
  };

  const endGame = (
    isWin: boolean,
    reasonText: string,
    calculatedScore?: number,
    endingType?: keyof typeof ENDINGS,
  ) => {
    // FIX 2: scoreRef.current kullan, stale closure değil
    const finalScore = Math.max(
      0,
      calculatedScore !== undefined ? calculatedScore : scoreRef.current,
    );
    
    if (db) {
        addDoc(collection(db, "leaderboard"), {
          name: (playerName || "Anonim").substring(0, 100),
          score: Math.min(Math.max(0, Math.round(finalScore)), 1000000),
          status: reasonText.substring(0, 200),
          createdAt: serverTimestamp(),
        }).catch((err) => handleFirestoreError(err, OperationType.CREATE, "leaderboard"));
    }

    if (calculatedScore !== undefined) {
      setScoreSafe(Math.max(0, calculatedScore));
    }

    if (endingType) {
      setWinEnding(endingType);
    } else {
      if (reasonText.includes("FİZİKSEL") || reasonText.includes("TÜKENMİŞLİK") || reasonText.includes("ÇÖKÜŞ") && reasonText.includes("FİZİKSEL")) {
        setWinEnding("LOSER_HEALTH");
      } else if (reasonText.includes("PSİKOLOJİK") || (reasonText.includes("ÇÖKÜŞ") && reasonText.includes("PSİKOLOJİK"))) {
        setWinEnding("LOSER_MIND");
      } else if (reasonText.includes("VAZGEÇTİN") || reasonText.includes("İNTİHARI")) {
        setWinEnding("LOSER_SUCCESS");
      } else if (reasonText.includes("YETENEĞİNİ") || reasonText.includes("YETERSİZLİĞİ")) {
        setWinEnding("LOSER_TALENT");
      } else {
        setWinEnding("LOSER_DEFAULT");
      }
    }

    let cinematicKey: CinematicType | null = null;
    if (isWin && endingType) {
      cinematicKey = endingType;
    } else if (!isWin) {
      if (endingType) {
        cinematicKey = endingType as CinematicType;
      } else if (reasonText.includes("FİZİKSEL") || reasonText.includes("TÜKENMİŞLİK")) {
        cinematicKey = "LOSER_HEALTH";
      } else if (reasonText.includes("PSİKOLOJİK")) {
        cinematicKey = "LOSER_MIND";
      } else if (reasonText.includes("VAZGEÇTİN") || reasonText.includes("İNTİHARI")) {
        cinematicKey = "LOSER_SUCCESS";
      } else if (reasonText.includes("YETENEĞİNİ") || reasonText.includes("YETERSİZLİĞİ")) {
        cinematicKey = "LOSER_TALENT";
      }
    }

    if (cinematicKey) {
      playCinematic(cinematicKey, () => {
        setGameState(isWin ? "WIN" : "GAMEOVER");
      });
    } else {
      setGameState(isWin ? "WIN" : "GAMEOVER");
    }
  };

  useEffect(() => {
    if (level > 1) {
      setLevelUpMsg(`Level ${level}!`);
      setTimeout(() => setLevelUpMsg(null), 3000);
    }
  }, [level]);

  useEffect(() => {
    if (gameState === "LYNCH") {
      if ("vibrate" in navigator && isVibrationEnabled) navigator.vibrate([200, 100, 200]);

      const resInterval = setInterval(() => {
        // FIX 3: applyStatChanges içindeki setState karışıklığını önlemek için
        // direkt setStats çağrısı yapıyoruz burada
        setStats((prev) => ({
          ...prev,
          resilience: Math.max(0, prev.resilience - 1),
        }));
      }, 1000);

      const commentInterval = setInterval(() => {
        if ("vibrate" in navigator && isVibrationEnabled) navigator.vibrate([100, 50, 100]);
        const nextComment = randomItem(COMMENT_TEMPLATES.lynch_scrolling);

        setActiveLynchComments((prev) => {
          const newComment = {
            id: Date.now(),
            text: replacePlaceholders(nextComment),
            x: Math.random() * 100,
            y: 0,
            scale: 1,
          };
          return [...prev.slice(-7), newComment];
        });
      }, 1500);

      return () => {
        clearInterval(resInterval);
        clearInterval(commentInterval);
        if ("vibrate" in navigator) navigator.vibrate(0);
        setActiveLynchComments([]);
      };
    }
  }, [gameState, isVibrationEnabled]);

  const replacePlaceholders = (text: string) => {
    if (!character) return text;
    return text
      .replace(/{name}/g, character.name)
      .replace(/{vocal}/g, character.vocalTone.toLowerCase())
      .replace(/{style}/g, character.clothingStyle.toLowerCase())
      .replace(/{dance}/g, character.danceStyle.toLowerCase())
      .replace(/{hair}/g, character.hairColor.toLowerCase())
      .replace(/{trait}/g, character.trait.toLowerCase())
      .replace(/{physical}/g, character.physicalTrait.toLowerCase())
      .replace(/{height}/g, character.height.toLowerCase())
      .replace(/{body}/g, character.bodyType.toLowerCase());
  };

  const [selectedTrait, setSelectedTrait] = useState<{
    label: string;
    value: string;
    path?: string;
  } | null>(null);

  const TRAIT_IMAGE_MAP: Record<string, Record<string, string>> = {
    "Saç Rengi": {
      "Gece Mavisi": "gece_mavisi.png",
      "Gümüş Gri": "gumus_gri.png",
      "Platin Sarı": "platin_sari.png",
      "Kızıl": "kizil.png",
      "Kömür Siyahı": "siyah.png",
      "Kahve": "kahve.png",
      "Pastel Pembe": "pastel_pembe.png",
      "Neon Yeşil": "neon_yesil.png",
    },
    "Giyim Tarzı": {
      "Sokak Modası": "sokak_modasi.png",
      "Kawaii": "kawaii.png",
      "Gotik": "gotik.png",
      "Minimalist": "Minimalist.png",
      "Spor": "Spor.png",
      "Avangart": "Avangart.png",
      "Y2K": "Y2k.png",
      "Oversize": "Oversize.png",
    },
    "Vokal Tınısı": {
      "Eşsiz ve Buğulu": "essiz_bugulu.png",
      "Güçlü ve Yüksek": "Guclu_yuksek.png",
      "Yumuşak ve Ritmik": "yumusak_ritmik.png",
      "Duygulu ve Akustik": "Duygulu_akustik.png",
      "Enerjik Pop": "enerjik_pop.png",
      "Derin Bas": "Derin_bas.png",
    },
    "Dans Stili": {
      "Keskin Hip-Hop": "keskin_hiphop.png",
      "Akıcı Modern Dans": "akici_modern_dans.png",
      "Güçlü K-Pop": "guclu_kpop.png",
      "Zarif Bale Temelli": "bale_temelli.png",
      "Serbest Stil": "serbest_stil.png",
      "Freestyle": "tembel.png",
    },
    "Fiziksel Özellik": {
      "Keskin Yüz Hatlı": "keskin_yuz_hatli.png",
      "Aura Sahibi": "aura_sahibi.png",
      "Karizmatik": "karizmatik.png",
      "Dövme Kaplı": "dovme_kapli.png",
      "Soğuk Bakışlı": "soguk_bakisli.png",
      "Şirin Görünümlü": "sirin_goronumlu.png",
    },
  };

  const getTraitImagePath = (label: string, value: string) => {
    return undefined;
  };

  const initializeRandomCharacter = () => {
    const char: Character = {
      name: randomItem(NAMES),
      gender: randomItem(GENDERS),
      hairColor: randomItem(HAIR_COLORS),
      clothingStyle: randomItem(CLOTHING_STYLES),
      physicalTrait: randomItem(PHYSICAL_TRAITS),
      vocalTone: randomItem(VOCAL_TONES),
      danceStyle: randomItem(DANCE_STYLES),
      trait: randomItem(PERSONALITY_TRAITS),
      height: randomItem(HEIGHTS),
      bodyType: randomItem(BODY_TYPES),
      background: "",
    };
    setCharacter(char);
    setGameState("CUSTOMIZE");
  };

  const updateCharacterTrait = (
    key: keyof Character,
    arr: string[],
    direction: 1 | -1,
  ) => {
    if (!character) return;
    const currentIndex = arr.indexOf(character[key] as string);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = arr.length - 1;
    if (newIndex >= arr.length) newIndex = 0;

    setCharacter({ ...character, [key]: arr[newIndex] });
  };

  // const generateAvatar = async () => { ... } // Removed

  const startJourney = () => {
    if (!character) return;

    const updatedChar = { ...character };
    updatedChar.background = `Sen ${updatedChar.name}. Sosyal medyanın acımasız dünyasında bir stajyersin. ${updatedChar.hairColor} saçların ve ${updatedChar.clothingStyle} tarzınla dikkat çekiyorsun. İnsanlar seni daha çok '${updatedChar.physicalTrait}' olarak tanımlıyor. ${updatedChar.height} boyun ve ${updatedChar.bodyType} yapınla dikkat çekiyorsun. Vokal tının '${updatedChar.vocalTone}', dansın ise '${updatedChar.danceStyle}'. İnsanlar seni '${updatedChar.trait}' biri olarak tanıyor. Bu özelliklerinle sahnedeki yerini koruyabilecek misin, yoksa linç kültürünün kurbanı mı olacaksın?`;

    setCharacter(updatedChar);

    const randBaseTalent = Math.floor(Math.random() * 21) + 20; // 20-40
    let initialTalent = randBaseTalent;
    if (
      updatedChar.vocalTone.includes("Güçlü") ||
      updatedChar.danceStyle.includes("Güçlü")
    )
      initialTalent += 15;
    if (
      updatedChar.vocalTone.includes("Zayıf") ||
      updatedChar.danceStyle.includes("Kalas")
    )
      initialTalent -= 10;

    setStats({
      health: Math.floor(Math.random() * 31) + 70, // 70-100
      resilience: Math.floor(Math.random() * 41) + 50, // 50-90
      success: Math.floor(Math.random() * 21) + 10, // 10-30
      talent: Math.max(0, Math.min(100, initialTalent)),
    });
    generateSocialComments(60, 50);
    setGameState("HUB");
    setLevel(1);
    setTasksCompletedInLevel(0);
    setStageFails({ health: 0, resilience: 0, success: 0, talent: 0 });
    // Skoru sıfırla
    setScoreSafe(0);
    setFanCountSafe(0);
  };

  const handleLynchResponse = (
    commentId: string,
    type: "insult" | "ignore" | "self_compassion",
  ) => {
    setLynchInteractions((prev) => prev + 1);
    setSocialComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return { ...c, replied: true };
        }
        return c;
      }),
    );

    if (type === "insult") {
      if (stats.resilience < 20) {
        applyStatChanges({ resilience: -15, success: -20 });
        setEventMessage(
          "Bir yorum bardağı taşıran son damla oldu. Zaten psikolojik olarak tükenmiştin, verdiğin sert tepkiyi basın anında büyüttü.\n\n[KRİTİK HATA!]\nMedya kampanyası seni yok etti ve tüm şirket anlaşmaların iptal edildi.",
        );
        endGame(false, "SKANDAL KURBANI", scoreRef.current, "SCANDAL_VICTIM");
        return;
      }
      applyStatChanges({ resilience: -15, success: -20 });
      setFanCountSafe((prev) => prev - 200);
    } else if (type === "self_compassion") {
      applyStatChanges({ resilience: 20 });
      setFanCountSafe(
        (prev) => prev + Math.floor(stats.resilience / 10) * 50 * level,
      );
    } else if (type === "ignore") {
      setFanCountSafe(
        (prev) => prev + Math.floor(stats.resilience / 10) * 50 * level,
      );
    }
  };

  // FIX 5: generateSocialComments artık applyStatChanges dışında çağrılıyor
  const generateSocialComments = (
    successVal: number,
    resilienceVal: number,
    choiceText?: string,
    choiceSocialFeedback?: { text: string; isPositive: boolean }[],
  ) => {
    if (!character) return;

    const newComments: SocialComment[] = [];
    const numComments = Math.floor(Math.random() * 4) + 5;
    let fansChange = 0;

    const positiveChance = successVal / 100;

    if (choiceSocialFeedback && choiceSocialFeedback.length > 0) {
      choiceSocialFeedback.forEach((feedback) => {
        let t = replacePlaceholders(feedback.text);
        newComments.push({
          id: Math.random().toString(36).substring(7),
          user: randomItem(MOCK_USERS),
          text: t,
          isPositive: feedback.isPositive,
          likes: Math.floor(Math.random() * 5000) + 100,
          time: "Az önce",
          replied: false,
        });
        fansChange +=
          Math.floor(successVal / 10) * (feedback.isPositive ? 1 : -1);
      });
    } else if (choiceText) {
      const isCurrentlyPositive = Math.random() < positiveChance;
      if (isCurrentlyPositive) {
        newComments.push({
          id: Math.random().toString(36).substring(7),
          user: randomItem(MOCK_USERS),
          text: `"${choiceText}" yapmasını o kadar mantıklı buldum ki. Helal olsun 👏`,
          isPositive: true,
          likes: Math.floor(Math.random() * 5000) + 100,
          time: "Az önce",
          replied: false,
        });
        fansChange += Math.floor(successVal / 10) * 1;
      } else {
        newComments.push({
          id: Math.random().toString(36).substring(7),
          user: randomItem(MOCK_USERS),
          text: `"${choiceText}" diyeceğine gidip düzgünce işini yapsaydı keşke... Cringe.`,
          isPositive: false,
          likes: Math.floor(Math.random() * 5000) + 100,
          time: "Az önce",
          replied: false,
        });
        fansChange += Math.floor(successVal / 10) * -1;
      }
    }

    for (let i = 0; i < numComments; i++) {
      const isPositive = Math.random() < positiveChance;
      let templates = isPositive
        ? COMMENT_TEMPLATES.positive
        : COMMENT_TEMPLATES.negative;

      if (!isPositive && (successVal < 30 || resilienceVal < 30)) {
        templates = templates.concat(COMMENT_TEMPLATES.lynch_scrolling);
      }

      let text = randomItem(templates);
      text = replacePlaceholders(text);

      newComments.push({
        id: Math.random().toString(36).substring(7),
        user: randomItem(MOCK_USERS) + Math.floor(Math.random() * 99),
        text,
        isPositive,
        likes: Math.floor(
          Math.random() *
            (isPositive ? successVal * 10 : (100 - successVal) * 5),
        ),
        time: `${Math.floor(Math.random() * 23)}s önce`,
        analysisNote: !isPositive
          ? randomItem([
              "Kendi başarısızlığını örtmeye çalışıyor.",
              "Bu kişi muhtemelen gündemden düşmekten korkuyor.",
              "Sadece ilgi çekmek için yazılmış bir tür nefret söylemi.",
              "Kendi hayatındaki mutsuzluğu yansıtıyor.",
            ])
          : undefined,
        replied: false,
      });
      fansChange += Math.floor(successVal / 10) * (isPositive ? 1 : -1);
    }

    setFanCountSafe((prev) => prev + fansChange);

    setSocialComments((prev) => [...newComments, ...prev].slice(0, 30));
  };

  const [isResting, setIsResting] = useState(false);
  const [isMentalBreakdown, setIsMentalBreakdown] = useState(false);
  const [isSuccessDrop, setIsSuccessDrop] = useState(false);
  const [isTalentDrop, setIsTalentDrop] = useState(false);
  const [warningsShown, setWarningsShown] = useState({
    health: false,
    resilience: false,
    success: false,
    talent: false,
  });

  useEffect(() => {
    if (
      stats.health <= 0 &&
      gameState === "HUB" &&
      !isResting &&
      !isMentalBreakdown &&
      !isSuccessDrop &&
      !isTalentDrop &&
      !warningsShown.health
    ) {
      setIsResting(true);
    } else if (
      stats.resilience <= 0 &&
      gameState === "HUB" &&
      !isMentalBreakdown &&
      !isResting &&
      !isSuccessDrop &&
      !isTalentDrop &&
      !warningsShown.resilience
    ) {
      setIsMentalBreakdown(true);
    } else if (
      stats.success <= 0 &&
      gameState === "HUB" &&
      !isSuccessDrop &&
      !isResting &&
      !isMentalBreakdown &&
      !isTalentDrop &&
      !warningsShown.success
    ) {
      setIsSuccessDrop(true);
    } else if (
      stats.talent <= 0 &&
      gameState === "HUB" &&
      !isTalentDrop &&
      !isResting &&
      !isMentalBreakdown &&
      !isSuccessDrop &&
      !warningsShown.talent
    ) {
      setIsTalentDrop(true);
    }
  }, [
    stats.health,
    stats.resilience,
    stats.success,
    stats.talent,
    gameState,
    isResting,
    isMentalBreakdown,
    isSuccessDrop,
    isTalentDrop,
  ]);

  // FIX 6: applyStatChanges artık setState callback'i içinde başka setState çağırmıyor
  // generateSocialComments çağrısı setState dışına alındı
  const applyStatChanges = (
    changes: Partial<Stats>,
    choiceText?: string,
    choiceSocialFeedback?: { text: string; isPositive: boolean }[],
  ) => {
    let newSuccess = 0;
    let newResilience = 0;

    setStats((prev) => {
      const newStats = {
        health: Math.max(0, Math.min(100, prev.health + (changes.health || 0))),
        resilience: Math.max(
          0,
          Math.min(100, prev.resilience + (changes.resilience || 0)),
        ),
        success: Math.max(
          0,
          Math.min(100, prev.success + (changes.success || 0)),
        ),
        talent: Math.max(0, Math.min(100, prev.talent + (changes.talent || 0))),
      };
      newSuccess = newStats.success;
      newResilience = newStats.resilience;

      return newStats;
    });

    // FIX 7: generateSocialComments setState dışında, setTimeout ile bir sonraki tick'te çağrılıyor
    setTimeout(() => {
      generateSocialComments(
        newSuccess,
        newResilience,
        choiceText,
        choiceSocialFeedback,
      );
    }, 0);
  };

  const eventModules: Record<string, () => Promise<{ EVENTS: GameEvent[] }>> = {
    stage: () => import('./data/events/stage'),
    interview: () => import('./data/events/interview'),
    room: () => import('./data/events/room'),
    dance: () => import('./data/events/dance'),
    vocal: () => import('./data/events/vocal'),
    common: () => import('./data/events/common'),
  };

  const loadEvents = async (locId: string): Promise<GameEvent[]> => {
    try {
      if (locId === 'interview') {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const { handleFirestoreError, OperationType } = await import('./firebaseUtils');
        
        try {
          if (db) {
              const { query, where } = await import('firebase/firestore');
              const q = query(collection(db, 'events'), where('location', '==', 'interview'));
              const snapshot = await getDocs(q);
              return snapshot.docs.map((d) => d.data() as GameEvent);
          }
          return [];
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'events');
          return [];
        }
      }

      const fn = eventModules[locId];
      if (!fn) return [];
      const module = await fn();
      return module.EVENTS;
    } catch (e) {
      console.error(`Failed to load events for ${locId}`, e);
      return [];
    }
  };

  const triggerLocationEvent = async (locId: string) => {
    setIsLoadingEvent(true);
    if (locId === "stage") {
      const stageEvents = await loadEvents("stage");
      let appropriateEvents = stageEvents.filter((e) => {
        const levelMatch = e.description.match(/Level (\d+)/);
        if (levelMatch) {
          return parseInt(levelMatch[1]) <= level;
        }
        return true;
      });

      if (appropriateEvents.length === 0) appropriateEvents = stageEvents;

      let possibleEvents = appropriateEvents.filter(
        (e) => !usedEventIds.includes(e.id),
      );
      if (possibleEvents.length === 0) {
        possibleEvents = appropriateEvents;
        setUsedEventIds((prev) =>
          prev.filter((id) => !appropriateEvents.some((e) => e.id === id)),
        );
      }

      const stageEvent = randomItem(possibleEvents);
      setUsedEventIds((prev) => [...prev, stageEvent.id]);
      setCurrentEvent(stageEvent);
      setIsLoadingEvent(false);
      setGameState("EVENT");
      return;
    }

    const locEvents = await loadEvents(locId);
    if (locEvents.length > 0) {
      let possibleEvents = locEvents.filter(
        (e) => !usedEventIds.includes(e.id),
      );
      if (possibleEvents.length === 0) {
        possibleEvents = locEvents;
        setUsedEventIds((prev) =>
          prev.filter((id) => !locEvents.some((e) => e.id === id)),
        );
      }

      const randomEvent = randomItem(possibleEvents);
      setUsedEventIds((prev) => [...prev, randomEvent.id]);
      setCurrentEvent(randomEvent);
      setIsLoadingEvent(false);
      setGameState("EVENT");
    } else {
      setIsLoadingEvent(false);
      setShowWarning("Bu konum için soru bulunamadı.");
      setTimeout(() => setShowWarning(null), 3000);
    }
  };

  const goToLocation = async (locId: string) => {
    console.log("Navigating to:", locId, "tasksCompletedInLevel:", tasksCompletedInLevel);
    if (tasksCompletedInLevel >= 4 && locId !== "stage") {
      console.log("Navigation blocked by tasksCompletedInLevel >= 4");
      return;
    }

    if (locId === "stage" && tasksCompletedInLevel < 4) {
      setShowWarning("Sahneye çıkmak için en az 4 görev tamamlamalısın!");
      setTimeout(() => setShowWarning(null), 3000);
      return;
    }

    let lynchChance = Math.min(0.2, 0.05 + level * 0.03);
    if (stats.resilience < 30 || stats.health < 30)
      lynchChance = Math.min(0.35, lynchChance + 0.15);
    else if (stats.success > 80) lynchChance = Math.min(0.3, lynchChance + 0.1);

    if (level >= 1 && locId !== "stage" && Math.random() < lynchChance) {
      const reason = randomItem(LYNCH_REASONS);
      triggerLynch(reason);
      return;
    }

    if (locId !== "stage" && locId !== "common") {
      setSelectedLocation(locId);
      setGameState("LOCATION_VIEW");
      return;
    }

    await triggerLocationEvent(locId);
  };

  useEffect(() => {
    if (gameState === "HUB") {
      const interval = setInterval(() => {
        if (Math.random() < 0.05 + level * 0.02) {
          triggerLynch(
            "Durup dururken sosyal medyada eski bir videon kesilip biçilerek yayıldı. İnsanlar linç etmek için fırsat arıyordu!",
          );
        }
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [gameState, level, stats]);

  const triggerLynch = (reason?: string | React.MouseEvent) => {
    setLynchCount((c) => c + 1);
    let difficulty: "easy" | "medium" | "hard" = "easy";
    if (level >= 3) difficulty = "hard";
    else if (level >= 2) difficulty = "medium";

    const filtered = BOOK_QUOTES.filter(
      (q) => (q.difficulty || "easy") === difficulty,
    );
    const randomQuote =
      filtered.length > 0 ? randomItem(filtered) : randomItem(BOOK_QUOTES);

    setCurrentQuote(randomQuote);
    if (typeof reason === "string") {
      setLynchReason(reason);
      // FIX 8: Lynch anında stat düşürme applyStatChanges ile yapılıyor (generateSocialComments ayrı çalışacak)
      applyStatChanges({ resilience: -15, health: -5 });
    } else {
      setLynchReason(null);
    }
    setGameState("LYNCH");
  };

  const handleChoice = (
    effects: Partial<Stats>,
    message: string,
    isStage: boolean = false,
    traitResponse?: string,
    choiceText?: string,
    choiceSocialFeedback?: { text: string; isPositive: boolean }[],
    traitTag?: string,
  ) => {
    let finalMessage = message;

    if (traitTag && character && character.trait !== traitTag) {
      effects.resilience = (effects.resilience || 0) - 15;
      effects.success = (effects.success || 0) - 5;
      finalMessage +=
        "\n\n[Karakter Çelişkisi]: Seçimin, karakterinin yapısına pek uymadı. Hayranların bir tutarsızlık seziyor.";
    }

    if (traitResponse) {
      finalMessage += `\n\n[Sistem Uyarısı]: ${traitResponse}`;
      effects.resilience = (effects.resilience || 0) - 20;
    }

    // FIX 9: choiceScore hesaplama düzeltildi
    // Pozitif etkiler yüksek, negatif etkiler daha düşük puan cezası verir
    let choiceScore = 0;
    if (effects.success)
      choiceScore +=
        effects.success > 0 ? effects.success * 10 : effects.success * 3;
    if (effects.talent)
      choiceScore +=
        effects.talent > 0 ? effects.talent * 8 : effects.talent * 2;
    if (effects.resilience)
      choiceScore +=
        effects.resilience > 0
          ? effects.resilience * 5
          : effects.resilience * 2;
    if (effects.health)
      choiceScore +=
        effects.health > 0 ? effects.health * 5 : effects.health * 2;

    // FIX 10: scoreRef.current kullanarak stale closure'dan kaçınıyoruz
    const newTotalScore = Math.max(0, scoreRef.current + choiceScore);
    setScoreSafe(newTotalScore);

    if (isStage) {
      if (stats.success >= 80 && stats.health < 20 && stats.resilience < 20) {
        applyStatChanges(effects, choiceText, choiceSocialFeedback);
        setEventMessage(
          finalMessage +
            `\n\n[KRİTİK DURUM!]\nSahnede mükemmeldin ama bedenin ve zihnin iflas etti. Ancak şirket seni bırakmıyor. Sahneye çıkmaya devam edemiyorsun, sözleşmeni de feshedemiyorsun.\n\nKONTRAT HAPSİ NEDENİYLE KARİYERİN DONDU.`,
        );
        endGame(false, "KONTRAT HAPSİ", newTotalScore, "CONTRACT_PRISON");
        return;
      }

      if (
        stats.health <= 0 ||
        stats.resilience <= 0 ||
        stats.success <= 0 ||
        stats.talent <= 0
      ) {
        applyStatChanges(effects, choiceText, choiceSocialFeedback);
        const reason =
          stats.health <= 0
            ? "FİZİKSEL TÜKENMİŞLİK"
            : stats.resilience <= 0
              ? "PSİKOLOJİK ÇÖKÜŞ"
              : stats.success <= 0
                ? "KARİYER İNTİHARI (Hazır olmadan sahneye çıktın)"
                : "YETENEK YETERSİZLİĞİ";
        setEventMessage(
          finalMessage +
            `\n\n[KRİTİK HATA!]\nSahnede performans sergilemeye çalışırken zaten tamamen bitmiştin. Kendini zorladın ve her şey sona erdi.\n\n${reason} NEDENİYLE KARİYERİN SONA ERDİ.`,
        );
        endGame(false, reason, newTotalScore);
        return;
      }

      const newSuccess = Math.max(
        0,
        Math.min(100, stats.success + (effects.success || 0)),
      );
      const newResilience = Math.max(
        0,
        Math.min(100, stats.resilience + (effects.resilience || 0)),
      );
      const newTalent = Math.max(
        0,
        Math.min(100, stats.talent + (effects.talent || 0)),
      );
      const newHealth = Math.max(
        0,
        Math.min(100, stats.health + (effects.health || 0)),
      );

      let failedStat: keyof Stats | null = null;
      if (newHealth <= 0) failedStat = "health";
      else if (newResilience <= 0) failedStat = "resilience";
      else if (newSuccess <= 0) failedStat = "success";
      else if (newTalent <= 0) failedStat = "talent";

      if (failedStat) {
        if (stageFails[failedStat] >= 1) {
          applyStatChanges(effects, choiceText, choiceSocialFeedback);
          const reason =
            failedStat === "health"
              ? "FİZİKSEL TÜKENMİŞLİK"
              : failedStat === "resilience"
                ? "PSİKOLOJİK ÇÖKÜŞ"
                : failedStat === "success"
                  ? "KARİYER İNTİHARI"
                  : "YETENEK YETERSİZLİĞİ";
          setEventMessage(
            finalMessage +
              `\n\n[KRİTİK HATA!]\nAynı hatayı sahnede ikinci kez yaptın. Verilen şansı değerlendiremedin.\n\n${reason} NEDENİYLE KARİYERİN SONA ERDİ.`,
          );
          endGame(false, reason, newTotalScore);
          return;
        } else {
          setStageFails((prev) => ({
            ...prev,
            [failedStat!]: prev[failedStat!] + 1,
          }));

          const quote =
            failedStat === "health"
              ? "\n\n💡 Kafaya Takmama Sanatı: 'Bedenin senin enstrümanındır. Akordunu bozarsan, hiçbir şarkıyı çalamazsın. Önce iyileş.'"
              : failedStat === "resilience"
                ? "\n\n💡 Kafaya Takmama Sanatı: 'Başkalarının gürültüsü, senin iç sesini susturmasın. Zihnine sadece senin izin verdiklerin girebilir.'"
                : failedStat === "success"
                  ? "\n\n💡 Kafaya Takmama Sanatı: 'Başarının sıfırlandığı yer, aslında kimsenin beklentisi olmadan sıfırdan inşa edebileceğin tek özgürlük alanıdır.'"
                  : "\n\n💡 Kafaya Takmama Sanatı: 'Yetenek, sadece defalarca ayağa kalkabilme becerisinin süslü adıdır. Gelişime açık ol.'";

          const statName =
            failedStat === "health"
              ? "sağlığın"
              : failedStat === "resilience"
                ? "psikolojin"
                : failedStat === "success"
                  ? "başarın"
                  : "yeteneğin";

          setEventMessage(
            finalMessage +
              `\n\n[DİKKAT!]\nSahne sonrasında ${statName} sıfırlandı. Seviyeyi geçemedin. Ancak pes etmek yok, sana toparlanman için BİR ŞANS DAHA VERİLİYOR.${quote}\n\nEğitim merkezine dön ve kendini geliştir!`,
          );

          const adjustedEffects = { ...effects };
          if (newHealth <= 0)
            adjustedEffects.health = (adjustedEffects.health || 0) + 15;
          if (newResilience <= 0)
            adjustedEffects.resilience = (adjustedEffects.resilience || 0) + 15;
          if (newSuccess <= 0)
            adjustedEffects.success = (adjustedEffects.success || 0) + 15;
          if (newTalent <= 0)
            adjustedEffects.talent = (adjustedEffects.talent || 0) + 15;

          applyStatChanges(adjustedEffects, choiceText, choiceSocialFeedback);
          setTasksCompletedInLevel(0);
          setGameState("RESULT");
          return;
        }
      }

      // FIX 11: Level geçişinde tek applyStatChanges çağrısı — ikinci çift çağrı kaldırıldı
      const reqPoints = 20 + level * 8;

      if (level === 4) {
        applyStatChanges(effects, choiceText, choiceSocialFeedback);
        let ending: keyof typeof ENDINGS = "GROUP_MEMBER";
        let finalBonus = 0;

        if (newSuccess < reqPoints) {
          if (fanCountRef.current > 30000 && lynchInteractions > 8) {
            ending = "FAN_PHENOMENON";
            finalBonus = 1500;
          } else if (newResilience < 40 && newTalent <= 60) {
            ending = "RETIREMENT";
            finalBonus = 500;
          } else if (newTalent > 60) {
            ending = "SOLO_CAREER";
            finalBonus = 2000;
          } else if (newSuccess < 40 && lynchCount === 0) {
            ending = "QUIET_RETIREMENT";
            finalBonus = 0;
          } else {
            ending = "INFLUENCER";
            finalBonus = 1000;
          }

          setEventMessage(
            finalMessage +
              `\n\n💫 Okyanusları aşamadın belki ama, kendine yeni bir yol çizdin! ${ENDINGS[ending].desc}`,
          );
        } else {
          if (fanCountRef.current > 50000) {
            ending = "INTERNATIONAL";
            finalBonus = 4000;
          } else if (newResilience < 40) {
            ending = "SOLO_CAREER";
            finalBonus = 2000;
          } else if (newHealth < 40) {
            ending = "RETIREMENT";
            finalBonus = 500;
          } else if (newTalent < 50) {
            ending = "INFLUENCER";
            finalBonus = 1000;
          } else {
            ending = "GROUP_MEMBER";
            finalBonus = 3000;
          }

          setEventMessage(
            finalMessage +
              `\n\n💫 TEBRİKLER! Okyanusları Aştın! ${ENDINGS[ending].desc}`,
          );
        }

        // setScoreSafe satırını sil
        endGame(
          true,
          ENDINGS[ending].title,
          newTotalScore + finalBonus,
          ending,
        );
        return;
      }

      if (newSuccess >= reqPoints) {
        // Efektleri ve level bonus'unu tek seferde birleştiriyoruz
        const combinedEffects: Partial<Stats> = {
          health: (effects.health || 0) - 5,
          resilience: (effects.resilience || 0) + 10,
          success: (effects.success || 0) + 15,
          talent: effects.talent || 0,
        };
        applyStatChanges(combinedEffects, choiceText, choiceSocialFeedback);

        const stageFans = newSuccess * 100 * level;
        setFanCountSafe((prev) => prev + stageFans);

        setEventMessage(
          finalMessage +
            `\n\n🌟 Muhteşem bir performans! ${level}. Leveli başarıyla geçtin! (Level Atlama Komisyonu: Başarı +15, Psikoloji +10)\nKarşılandığın coşku sana ${stageFans.toLocaleString()} yeni takipçi kazandırdı!`,
        );

        // Level atlama bonus puanı
        setScoreSafe((s) => s + 500 * level);

        const nextLevel = level + 1;
        setLevel(nextLevel);
        setTasksCompletedInLevel(0);
        setStageFails({ health: 0, resilience: 0, success: 0, talent: 0 });
        
        let cinematicType: CinematicType | null = null;
        if (nextLevel === 2) cinematicType = "LEVEL_2";
        else if (nextLevel === 3) cinematicType = "LEVEL_3";
        else if (nextLevel === 4) cinematicType = "LEVEL_4";
        
        if (cinematicType) {
          playCinematic(cinematicType, () => setGameState("RESULT"));
          return;
        }
      } else {
        // Başarısız sahne — ceza efektlerini de birleştiriyoruz
        const failEffects: Partial<Stats> = {
          health: (effects.health || 0) - 5,
          resilience: (effects.resilience || 0) - 10,
          success: (effects.success || 0) - 15,
          talent: effects.talent || 0,
        };
        applyStatChanges(failEffects, choiceText, choiceSocialFeedback);

        setFanCountSafe((prev) => Math.floor(prev * 0.8));

        setEventMessage(
          finalMessage +
            `\n\n[BAŞARISIZ SAHNE]\nPerformansını tamamladın ancak jürinin gözünde yeterli eşiği geçemedin. (Gereken: En az ${reqPoints} Başarı). Ancak şirketin kararıyla bir sonraki aşamaya güç bela geçirildin!\n\n(Ceza Puanı uygulandı ve hayran kitleni kaybettin)`
        );

        // Başarısızlık ceza puanı
        setScoreSafe((s) => Math.max(0, s - 300));
        
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setTasksCompletedInLevel(0);
        setStageFails({ health: 0, resilience: 0, success: 0, talent: 0 });
        
        let cinematicType: CinematicType | null = null;
        if (nextLevel === 2) cinematicType = "LEVEL_2";
        else if (nextLevel === 3) cinematicType = "LEVEL_3";
        else if (nextLevel === 4) cinematicType = "LEVEL_4";
        
        if (cinematicType) {
          playCinematic(cinematicType, () => setGameState("RESULT"));
          return;
        }
      }
    } else {
      const levelMultiplier = 1 + level * 0.1;
      const adjustedEffects: Partial<Stats> = { ...effects };
      Object.keys(adjustedEffects).forEach((key) => {
        const val = adjustedEffects[key as keyof Stats];
        if (val && val < 0) {
          adjustedEffects[key as keyof Stats] = Math.floor(
            val * levelMultiplier,
          );
        }
      });
      applyStatChanges(adjustedEffects, choiceText, choiceSocialFeedback);
      setEventMessage(finalMessage);
      setTasksCompletedInLevel((t) => Math.min(4, t + 1));

      let negativeImpact = 0;
      Object.keys(adjustedEffects).forEach((key) => {
        const val = adjustedEffects[key as keyof Stats];
        if (val && val < 0) negativeImpact += Math.abs(val);
      });

      const lynchChance = 0.1 + negativeImpact / 100 + level * 0.05;

      if (Math.random() < lynchChance) {
        triggerLynch(
          "Sosyal medya seçimin üzerine üşüştü ve linç edilmeye başladın!",
        );
        return;
      }
    }
    setGameState("RESULT");
  };

  const [recoveryCount, setRecoveryCount] = useState({
    health: 0,
    resilience: 0,
    success: 0,
    talent: 0,
  });

  const getRecoveryStats = (
    type: "health" | "resilience" | "success" | "talent",
  ) => {
    const count = recoveryCount[type];
    const multiplier = Math.max(0.3, 1 - count * 0.25);

    switch (type) {
      case "health":
        return {
          effects: {
            health: Math.floor(20 * multiplier),
            resilience: Math.floor(15 * multiplier),
            success: -Math.floor(10 / multiplier),
            talent: -Math.floor(5 / multiplier),
          },
          message:
            count === 0
              ? "Dinlendin, toparlandın."
              : count === 1
                ? "Tekrar mola vermek zorunda kaldın. Piyasa seni unutmaya başladı."
                : "Üçüncü kez yere düştün. Artık kimse geri dönüp dönmeyeceğini bilmiyor.",
          fanLoss: count * 500,
        };
      case "resilience":
        return {
          effects: {
            resilience: Math.floor(20 * multiplier),
            health: Math.floor(15 * multiplier),
            success: -Math.floor(10 / multiplier),
            talent: -Math.floor(10 / multiplier),
          },
          message:
            count === 0
              ? "Terapiyle toparlandın."
              : count === 1
                ? "İkinci kriz. Menajerinle ilişkin gerildi."
                : "Tekrarlayan krizler seni 'güvenilmez' damgasıyla tanımlatıyor.",
          fanLoss: count * 500,
        };
      default:
        return { effects: {}, message: "", fanLoss: 0 };
    }
  };

  const takeBreak = () => {
    setRecoveryCount((prev) => ({ ...prev, health: prev.health + 1 }));
    applyStatChanges({
      health: 100,
      resilience: 20,
      success: -25,
      talent: -5,
    });
    setFanCountSafe((prev) => Math.max(0, prev - 2000));
    setEventMessage(
      "Aşırı yorgunluktan dolayı hastaneye kaldırıldın. Serumlar ve yoğun tedaviyle sağlığın tamamen doldu! Ancak haftalarca sahneden uzak kaldığın için sözleşmelerin iptal edildi ve başarı puanından sert bir düşüş yaşadın.\n\n💡 Kafaya Takmama Sanatı: 'Bedenin iflas ettiğinde dinlenmeyi seçmezsen, bedenin senin yerine seçer.'"
    );
    setIsResting(false);
    setGameState("RESULT");
  };

  const takeMentalBreak = () => {
    setRecoveryCount((prev) => ({ ...prev, resilience: prev.resilience + 1 }));
    applyStatChanges({
      resilience: 100,
      health: 20,
      success: -25,
      talent: -5,
    });
    setFanCountSafe((prev) => Math.max(0, prev - 2000));
    setEventMessage(
      "Ağır bir sinir krizi geçirdin ve mecburi olarak ruhsal inzivaya çekildin. Zihnin tamamen arındı ve psikolojin %100 yenilendi! Ancak bu süreçte dedikodular alıp başını gitti ve markan ciddi zarar gördü.\n\n💡 Kafaya Takmama Sanatı: 'Zihnini susturmak her şeyden önemlidir. Dünyayı kaçırdığını sanırsın ama aslında kendini bulursun.'"
    );
    setIsMentalBreakdown(false);
    setGameState("RESULT");
  };

  const takeSuccessRecovery = () => {
    console.log("Current recoveryCount.success:", recoveryCount.success);
    if (recoveryCount.success >= 2) {
      endGame(false, "KARİYERİNDEN VAZGEÇTİN", scoreRef.current);
      return;
    }
    setRecoveryCount((prev) => {
      console.log("Incrementing success count from:", prev.success);
      return { ...prev, success: prev.success + 1 };
    });
    applyStatChanges({
      success: 30,
      resilience: 15,
      health: -10,
    });
    setIsSuccessDrop(false);
    setEventMessage(
      "Başarın sıfırlandığı için imajını kurtarmak adına küçük çaplı şovlara ve projelere katıldın. Yorucu bir süreçti ama adını tekrar duyurmaya başladın.\n\n💡 Kafaya Takmama Sanatı: 'Zirveden düşmek son değildir, sadece yeni bir rotanın başlangıcıdır. Başkalarının alkışını değil, kendi adımlarını dinle.'",
    );
    setGameState("RESULT");
  };

  const takeTalentRecovery = () => {
    if (recoveryCount.talent >= 2) {
      endGame(false, "YETENEĞİNİ KAYBETTİN", scoreRef.current);
      return;
    }
    setRecoveryCount((prev) => ({ ...prev, talent: prev.talent + 1 }));
    applyStatChanges({
      talent: 30,
      health: -15,
      resilience: -10,
    });
    setIsTalentDrop(false);
    setEventMessage(
      "Yeteneğini tamamen kaybettiğini hissettiğinde, her şeyi bir kenara bırakıp temel eğitim kampına girdin. Geceni gündüzüne katarak eski formunu yakaladın ancak bu seni biraz yordu.\n\n💡 Kafaya Takmama Sanatı: 'Yetenek doğuştan gelmez, ter ve gözyaşı ile işlenir. Düşmek sadece yeniden daha güçlü kalkmak için bir fırsattır.'",
    );
    setGameState("RESULT");
  };

  useEffect(() => {
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      if (reason instanceof DOMException && reason.name === "AbortError") {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    let fadeInterval: NodeJS.Timeout;

    const fade = (targetVolume: number, onComplete?: () => void) => {
      clearInterval(fadeInterval);
      const step = 0.05;
      fadeInterval = setInterval(() => {
        if (Math.abs(audio.volume - targetVolume) < step) {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
          if (onComplete) onComplete();
        } else {
          audio.volume += audio.volume < targetVolume ? step : -step;
        }
      }, 50);
    };

    if (isMuted || !hasInteracted) {
      fade(0, () => audio.pause());
    } else {
      let trackUrl = "";

      if (gameState === "EVENT" && currentEvent?.location === "room") {
        trackUrl = "/music/room_music.mp3";
      } else if (gameState === "EVENT" && currentEvent?.location === "stage") {
        trackUrl = "/music/stage_music.mp3";
      } else if (
        gameState === "HUB" ||
        gameState === "RESULT" ||
        gameState === "SOCIAL_MEDIA" ||
        (gameState === "EVENT" &&
          !["room", "stage"].includes(currentEvent?.location || ""))
      ) {
        trackUrl = "/music/start_music.mp3";
      } else if (gameState === "START" || gameState === "CUSTOMIZE") {
        trackUrl = "/music/hub_music.mp3";
      } else if (gameState === "GAMEOVER") {
        trackUrl = "/music/gameover_music.mp3";
      } else if (gameState === "WIN") {
        trackUrl = "/music/win_music.mp3";
      } else if (gameState === "LYNCH") {
        trackUrl = "/music/lynch_music.mp3";
      } else if (gameState === "CINEMATIC") {
        if (currentCinematic?.includes("LEVEL")) {
           trackUrl = "/music/stage_music.mp3";
        } else if (currentCinematic?.includes("LOSER") || currentCinematic === "SCANDAL_VICTIM" || currentCinematic === "CONTRACT_PRISON") {
           trackUrl = "/music/gameover_music.mp3";
        } else {
           trackUrl = "/music/win_music.mp3";
        }
      }

      if (trackUrl) {
        if (!audio.src.endsWith(trackUrl)) {
          audio.src = trackUrl;
          audio.loop = true;
          audio.load();
          if (hasInteracted) {
            audio
              .play()
              .then(() => fade(0.4))
              .catch(() => {});
          }
        } else {
          if (audio.paused && hasInteracted) {
            audio
              .play()
              .then(() => fade(0.4))
              .catch(() => {});
          } else {
            fade(0.4);
          }
        }
      } else {
        fade(0, () => audio.pause());
      }
    }

    return () => clearInterval(fadeInterval);
  }, [gameState, currentEvent, isMuted, audio, hasInteracted, currentCinematic]);

  const shareApp = async () => {
    try {
      await navigator.share({
        title: "Kendi Yıldızını Yaz",
        text: `Ben oyunu ${Math.round(scoreRef.current)} puanla tamamladım! Sen de ünlü olmayı deneyebilirsin.`,
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      alert("Oyun linki kopyalandı! Arkadaşlarına gönderebilirsin.");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <div className="fixed top-6 right-6 z-[110] flex gap-3">
        <button
          onClick={() => setIsVibrationEnabled(!isVibrationEnabled)}
          className="p-3 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-slate-800 transition-all shadow-lg"
          title={isVibrationEnabled ? "Titreşimi Kapat" : "Titreşimi Aç"}
        >
          {isVibrationEnabled ? <Vibrate size={20} /> : <VibrateOff size={20} />}
        </button>
        <button
          onClick={toggleMute}
          className="p-3 bg-slate-900/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-slate-800 transition-all shadow-lg"
          title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {isAvatarModalOpen && character && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center"
          >
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 text-center">Avatarını Güncelle</h3>
            
            <div className="w-full flex flex-col items-center gap-4">
              <div 
                className={`relative w-48 h-48 rounded-2xl overflow-hidden bg-slate-800 border-2 border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)] ${character.imageUrl ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                onClick={() => character.imageUrl && window.open(character.imageUrl, '_blank')}
                title="Büyütmek için tıkla"
              >
                {character.imageUrl ? (
                  <img src={character.imageUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-slate-500 flex flex-col items-center text-center p-4">
                    <User size={48} className="mb-2 opacity-50" />
                  </div>
                )}
{/* Removed isGeneratingAvatar overlay */}              </div>
              
              <div className="w-full space-y-2 mt-4">


{/* AI ile Avatar Oluştur removed */}
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                           setCharacter({...character, imageUrl: e.target?.result as string});
                           setSocialComments(prev => [
                            {
                              id: `avatar-${Date.now()}`,
                              user: "fanclub_president",
                              text: "AMAN TANRIM! Yeni profil fotoğrafını gördünüz mü? Mükemmel görünüyor! 😍🔥",
                              likes: Math.floor(Math.random() * 500) + 1000,
                              isPositive: true,
                              time: "Şimdi"
                            },
                            ...prev
                          ]);
                          alert("Profil güncellendi! Hayranların fark etti.");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Kendi fotoğrafını yükle"
                  />
                  <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-purple-200 transition-all flex items-center justify-center gap-2 text-sm border border-slate-600">
                    <Camera size={16} />
                    Kendi Fotoğrafını Yükle
                  </button>
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}

      <div
        onClick={() => {
          if (!hasInteracted) {
            setHasInteracted(true);
          }
        }}
        className="min-h-screen font-sans overflow-x-hidden text-slate-100"
      >
        <div className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

        {levelUpMsg && (
          <div className="fixed top-20 left-0 right-0 z-[100] flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-600/90 text-white px-6 py-3 rounded-full font-bold shadow-lg"
            >
              {levelUpMsg}
            </motion.div>
          </div>
        )}

        {showWarning && (
          <div className="fixed top-32 left-0 right-0 z-[100] flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-rose-600/90 text-white px-6 py-3 rounded-full font-bold shadow-lg"
            >
              {showWarning}
            </motion.div>
          </div>
        )}

        {gameState === "START" && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl bg-slate-900/80 backdrop-blur-xl p-6 md:p-10 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-900/20"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-24 h-24 mb-6 rounded-full mx-auto border-2 border-purple-500/50"
              />
              <h1
                className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200"
                style={{ textShadow: "0 4px 20px rgba(236,72,153,0.2)" }}
              >
                Kendi Yıldızını Yaz
              </h1>
              <p className="text-lg md:text-xl text-purple-200/80 mb-6 leading-relaxed">
                Sosyal medyanın, acımasız eleştirilerin ve amansız rekabetin
                ortasında kendi ışığını bulabilir misin?
              </p>

              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="İsmini Gir..."
                className="w-full md:w-2/3 px-6 py-4 mb-8 bg-slate-800/80 border border-purple-500/50 rounded-2xl text-white text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-purple-500/80 placeholder:text-slate-500 transition-all shadow-inner"
                maxLength={20}
              />

              <button
                onClick={initializeRandomCharacter}
                disabled={!playerName.trim()}
                className={`w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white text-base md:text-lg transition-all ${playerName.trim() ? "hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(219,39,119,0.5)]" : "opacity-50 cursor-not-allowed"}`}
              >
                Karakterini Yarat ve Başla
              </button>
              
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="mt-4 px-6 py-2 bg-slate-800 text-purple-200 rounded-full font-semibold border border-purple-500/30 hover:bg-slate-700 transition"
              >
                Puan Tablosu
              </button>

              {isLeaderboardOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-3xl w-full max-w-md shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Puan Tablosu</h2>
                    <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-white/5">
                           <div className="flex items-center gap-3">
                             <span className={`font-bold ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-700" : "text-slate-500"}`}>
                               #{idx + 1}
                             </span>
                             <div className="flex flex-col">
                               <span className="text-purple-100 font-bold text-sm">{entry.name}</span>
                               <span className="text-slate-400 text-[10px]">{entry.status}</span>
                             </div>
                           </div>
                           <span className="text-purple-300 font-mono font-bold text-sm">{entry.score} Puan</span>
                        </div>
                      )) : (
                        <div className="text-center text-slate-500 text-sm py-4">Henüz puan tablosunda kimse yok.</div>
                      )}
                    </div>
                    <button
                      onClick={() => setIsLeaderboardOpen(false)}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 transition-colors text-white rounded-full font-bold shadow-lg shadow-purple-600/20"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col items-center gap-2">
                <a
                  href="https://youtube.com/@muhendisinkitapligi?si=_KaPFhwIrFYRvrlx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-rose-400 transition-colors group"
                >
                  <Youtube
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm border-b border-white/20 pb-0.5 group-hover:border-rose-400/50">
                    Destek için YouTube kanalıma abone olur musunuz?
                  </span>
                </a>
              </div>
            </motion.div>
          </div>
        )}

        {character && gameState === "CUSTOMIZE" && (
          <div className="relative z-10 flex flex-col items-center justify-start md:justify-center min-h-screen p-4 py-12 bg-slate-950 overflow-y-auto">
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 pointer-events-none"></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl relative z-10 flex flex-col items-center pb-40"
            >
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(216,180,254,0.3)]">
                  Kimliğini İnşa Et
                </h2>
                <p className="text-purple-200/60 text-sm md:text-base">
                  Sahneye çıkacak o kusursuz profili seç.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 w-full mb-8">
                {/* Sol Taraf: Avatar */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                  <div 
                    className={`relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-slate-800 border-2 border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)] ${character.imageUrl ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                    onClick={() => character.imageUrl && window.open(character.imageUrl, '_blank')}
                    title="Büyütmek için tıkla"
                  >
                    {character.imageUrl ? (
                      <img src={character.imageUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center text-center p-4">
                        <User size={48} className="mb-2 opacity-50" />
                        <span className="text-sm">Avatar henüz oluşturulmadı</span>
                      </div>
                    )}
                    {/* Removed isGeneratingAvatar overlay */}
                  </div>
                  
                  <div className="w-full max-w-[256px] space-y-2">
                    {/* Removed select and generate button */}

                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => setCharacter({...character, imageUrl: e.target?.result as string});
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Kendi fotoğrafını yükle"
                      />
                      <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-purple-200 transition-all flex items-center justify-center gap-2 text-sm border border-slate-600">
                        <Camera size={16} />
                        Kendi Fotoğrafını Yükle
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 text-center px-4">Özel fotoğrafını yükleyebilir veya yapay zekaya ürettirebilirsin!</p>
                </div>

                {/* Sağ Taraf: Özellikler */}
                <div className="w-full md:w-2/3 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="holo-panel flex flex-col items-center justify-center p-3 md:p-6 relative group overflow-hidden hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20 rounded-2xl md:rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/5 col-span-2 lg:col-span-1">
                    <span className="text-purple-300 font-bold text-[11px] md:text-xs tracking-widest uppercase mb-3 md:mb-4 text-center z-10">İsim</span>
                    <input 
                      type="text" 
                      value={character.name}
                      onChange={(e) => setCharacter({...character, name: e.target.value})}
                      className="w-full bg-slate-800/80 border border-slate-700 text-white font-bold text-center py-2 px-3 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 z-10"
                      placeholder="Kendi İsmin"
                    />
                    <div className="flex gap-2 mt-4 z-10">
                      <button onClick={() => updateCharacterTrait("name", NAMES, -1)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-purple-300"><ChevronLeft size={16} /></button>
                      <button onClick={() => updateCharacterTrait("name", NAMES, 1)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-purple-300"><ChevronRight size={16} /></button>
                    </div>
                  </div>

                  <InteractiveTraitCard
                    label="Cinsiyet"
                    value={character.gender}
                    onNext={() => updateCharacterTrait("gender", GENDERS, 1)}
                    onPrev={() => updateCharacterTrait("gender", GENDERS, -1)}
                    icon={User}
                  />
                  <InteractiveTraitCard
                    label="Fiziksel Özellik"
                  value={character.physicalTrait}
                  onNext={() =>
                    updateCharacterTrait("physicalTrait", PHYSICAL_TRAITS, 1)
                  }
                  onPrev={() =>
                    updateCharacterTrait("physicalTrait", PHYSICAL_TRAITS, -1)
                  }
                  icon={User}
                />
                <InteractiveTraitCard
                  label="Saç Rengi"
                  value={character.hairColor}
                  onNext={() =>
                    updateCharacterTrait("hairColor", HAIR_COLORS, 1)
                  }
                  onPrev={() =>
                    updateCharacterTrait("hairColor", HAIR_COLORS, -1)
                  }
                />
                <InteractiveTraitCard
                  label="Kişilik Özelliği"
                  value={character.trait}
                  onNext={() =>
                    updateCharacterTrait("trait", PERSONALITY_TRAITS, 1)
                  }
                  onPrev={() =>
                    updateCharacterTrait("trait", PERSONALITY_TRAITS, -1)
                  }
                  icon={Smile}
                />
                <InteractiveTraitCard
                  label="Vokal Tınısı"
                  value={character.vocalTone}
                  onNext={() =>
                    updateCharacterTrait("vocalTone", VOCAL_TONES, 1)
                  }
                  onPrev={() =>
                    updateCharacterTrait("vocalTone", VOCAL_TONES, -1)
                  }
                  icon={Mic}
                />
                <InteractiveTraitCard
                  label="Dans Stili"
                  value={character.danceStyle}
                  onNext={() =>
                    updateCharacterTrait("danceStyle", DANCE_STYLES, 1)
                  }
                  onPrev={() =>
                    updateCharacterTrait("danceStyle", DANCE_STYLES, -1)
                  }
                  icon={Activity}
                />
                <InteractiveTraitCard
                  label="Giyim Tarzı"
                  value={character.clothingStyle}
                  onNext={() =>
                    updateCharacterTrait("clothingStyle", CLOTHING_STYLES, 1)
                  }
                  onPrev={() =>
                    updateCharacterTrait("clothingStyle", CLOTHING_STYLES, -1)
                  }
                  icon={Activity}
                />
                <InteractiveTraitCard
                  label="Boy"
                  value={character.height}
                  onNext={() => updateCharacterTrait("height", HEIGHTS, 1)}
                  onPrev={() => updateCharacterTrait("height", HEIGHTS, -1)}
                  icon={Ruler}
                />
                <InteractiveTraitCard
                  label="Vücut Yapısı"
                  value={character.bodyType}
                  onNext={() => updateCharacterTrait("bodyType", BODY_TYPES, 1)}
                  onPrev={() =>
                    updateCharacterTrait("bodyType", BODY_TYPES, -1)
                  }
                  icon={User}
                />
              </div>
              </div>

              <div className="fixed md:sticky bottom-6 z-50 flex justify-center w-full px-4">
                <button
                  onClick={startJourney}
                  className="w-full md:w-auto px-10 md:px-16 py-4 md:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-full font-bold text-white text-lg md:text-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(219,39,119,0.5)] border border-white/20"
                >
                  Sahneye Çık &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {character && gameState !== "START" && gameState !== "CUSTOMIZE" && (
          <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
            {gameState === "HUB" && (
              <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/5 shadow-inner shadow-white/5 mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="relative group cursor-pointer shrink-0 w-16 h-16 md:w-24 md:h-24 mx-auto md:mx-0" onClick={() => setIsAvatarModalOpen(true)}>
                    {character.imageUrl ? (
                      <img src={character.imageUrl} alt="Avatar" className="w-full h-full rounded-full object-cover shadow-xl shadow-purple-900/20 ring-4 ring-white/10" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-indigo-400 flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-xl shadow-purple-900/20 ring-4 ring-white/10">
                        {character.name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2 justify-center md:justify-start">
                      <h2 className="text-xl md:text-3xl font-bold text-slate-100">
                        {character.name}
                      </h2>
                      <div className="flex gap-2 flex-wrap mt-2 justify-center md:justify-start">
                        <div className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider">
                          LEVEL {level}/4
                        </div>
                        <div className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider">
                          Görev: {tasksCompletedInLevel}/4
                        </div>
                        <div className="px-3 py-1 bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider font-mono">
                          Skor: {Math.round(score)}
                        </div>
                        <div className="px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-500/30 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider font-mono flex items-center gap-1">
                          <Users size={12} /> {fanCount.toLocaleString()}
                        </div>
                      </div>
                      {level < 4 && (
                        <div className="mt-2 text-xs text-slate-400 text-center md:text-left animate-pulse">
                          4. Seviyeye ulaşarak çıkış yap ve kariyerini kurtar!
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-1.5 md:gap-3 mt-3">
                      {[
                        { label: "Saç Rengi", value: character.hairColor },
                        {
                          label: "Giyim Tarzı",
                          value: character.clothingStyle,
                        },
                        { label: "Vokal Tınısı", value: character.vocalTone },
                        { label: "Dans Stili", value: character.danceStyle },
                        {
                          label: "Fiziksel Özellik",
                          value: character.physicalTrait,
                        },
                      ].map((t, idx) => {
                        const path = getTraitImagePath(t.label, t.value);
                        return path ? (
                          <img
                            key={idx}
                            src={path}
                            loading="lazy"
                            className="w-8 h-8 md:w-16 md:h-16 rounded-full border-2 border-purple-500/30 object-cover hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer ring-offset-2 ring-offset-slate-900"
                            onClick={() => setSelectedTrait({ ...t, path })}
                            title={`${t.label}: ${t.value}`}
                            alt={t.value}
                          />
                        ) : null;
                      })}
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-400/60 mt-3 md:mt-2 italic">
                      {character.vocalTone} • {character.danceStyle} •{" "}
                      {character.trait} • {character.physicalTrait} •{" "}
                      {character.height} • {character.bodyType}
                    </p>
                  </div>
                </div>
                {level === 1 && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-slate-300 italic text-xs md:text-base leading-relaxed">
                      {character.background}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <StatBar
                icon={<Heart className="text-rose-400" size={18} />}
                label="Sağlık"
                value={stats.health}
                color="bg-rose-500"
                attempts={Math.max(0, 2 - recoveryCount.health)}
              />
              <StatBar
                icon={<ShieldAlert className="text-indigo-400" size={18} />}
                label="Psikoloji"
                value={stats.resilience}
                color="bg-indigo-500"
                attempts={Math.max(0, 2 - recoveryCount.resilience)}
              />
              <StatBar
                icon={<Star className="text-amber-400" size={18} />}
                label="Başarı"
                value={stats.success}
                color="bg-amber-500"
                attempts={Math.max(0, 2 - recoveryCount.success)}
              />
              <StatBar
                icon={<Zap className="text-emerald-400" size={18} />}
                label="Yetenek"
                value={stats.talent}
                color="bg-emerald-500"
                attempts={Math.max(0, 2 - recoveryCount.talent)}
              />
            </div>
            
            {gameState === "HUB" && (
              <div className="flex flex-col gap-2 mb-6">
                {warningsShown.health && (
                  <div className="bg-rose-900/40 border border-rose-500/50 text-rose-200 text-xs md:text-sm p-3 rounded-xl text-center shadow-lg shadow-rose-900/20 animate-pulse font-semibold">
                    ⚠️ SAĞLIK TÜKENDİ! Bedenini çok zorladın. Sahnede bunun bedelini ödeyeceksin.
                  </div>
                )}
                {warningsShown.resilience && (
                  <div className="bg-indigo-900/40 border border-indigo-500/50 text-indigo-200 text-xs md:text-sm p-3 rounded-xl text-center shadow-lg shadow-indigo-900/20 animate-pulse font-semibold">
                    ⚠️ PSİKOLOJİN ÇÖKTÜ! Zihnin bulanık. Sahnede bunun bedelini ödeyeceksin.
                  </div>
                )}
                {warningsShown.success && (
                  <div className="bg-amber-900/40 border border-amber-500/50 text-amber-200 text-xs md:text-sm p-3 rounded-xl text-center shadow-lg shadow-amber-900/20 animate-pulse font-semibold">
                    ⚠️ BAŞARIN SIFIRLANDI! İtibarın sarsıldı. Sahnede bunun bedelini ödeyeceksin.
                  </div>
                )}
                {warningsShown.talent && (
                  <div className="bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 text-xs md:text-sm p-3 rounded-xl text-center shadow-lg shadow-emerald-900/20 animate-pulse font-semibold">
                    ⚠️ YETENEĞİN KÖRELDİ! Performansın düştü. Sahnede bunun bedelini ödeyeceksin.
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 relative pb-12">
              <AnimatePresence mode="wait">
                {gameState === "HUB" && (
                  <motion.div
                    key="hub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-4">
                      <h3 className="text-lg md:text-2xl font-bold text-slate-200">
                        Nereye gitmek istersin?
                      </h3>
                      <div className="flex items-center gap-2 z-40">
                        <button
                          onClick={() => setGameState("SOCIAL_MEDIA")}
                          className={`p-2.5 rounded-full border text-slate-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg relative bg-slate-800 hover:bg-slate-700 border-white/10`}
                          title="Sosyal Medya"
                        >
                          <Smartphone size={20} />
                          <span className="hidden sm:inline font-semibold">
                            Sosyal Medya
                          </span>
                          {socialComments.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {isResting ? (
                      <div className="bg-rose-950/40 p-8 md:p-12 rounded-[2.5rem] border border-rose-500/30 mb-8 backdrop-blur-xl text-center shadow-2xl shadow-rose-950/50">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/40">
                          <AlertTriangle className="text-rose-500" size={32} />
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-4">
                          Tükendin!
                        </h3>
                        <p className="text-rose-200 mb-8 leading-relaxed max-w-md mx-auto text-xs md:text-base">
                          Vücudun sinyal veriyor. Daha fazla devam edemezsin. Eğer hiçbir şey yapmazsan, bir sonraki sahnede sonuçlarına katlanacaksın.
                        </p>
                        
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={takeBreak}
                            className="px-8 py-3 md:px-10 md:py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold transition-all shadow-lg shadow-rose-900/50 flex items-center gap-3 transform hover:scale-105 active:scale-95"
                          >
                            <Activity size={20} /> Tedavi Ol ve Dinlen
                          </button>
                        </div>
                        
                        <div className="flex justify-center items-center mt-6">
                          <button
                            onClick={() => {
                              setWarningsShown(prev => ({ ...prev, health: true }));
                              setIsResting(false);
                              setGameState("HUB");
                            }}
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-semibold transition-all border border-slate-600"
                          >
                            Sağlığını Hiçe Sayarak Devam Et
                          </button>
                        </div>
                      </div>
                    ) : isMentalBreakdown ? (
                      <div className="bg-indigo-950/40 p-8 md:p-12 rounded-[2.5rem] border border-indigo-500/30 mb-8 backdrop-blur-xl text-center shadow-2xl shadow-indigo-950/50">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/40">
                          <AlertTriangle
                            className="text-indigo-400"
                            size={32}
                          />
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-4">
                          Psikolojik Çöküş!
                        </h3>
                        <p className="text-indigo-200 mb-8 leading-relaxed max-w-md mx-auto text-xs md:text-base">
                          Zihnin ve ruhun artık gelen baskıyı kaldıramıyor. Eğer zihnine iyi bakmazsan, sahnede bunun sonuçlarını göreceksin.
                        </p>
                        
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={takeMentalBreak}
                            className="px-8 py-3 md:px-10 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-3 transform hover:scale-105 active:scale-95"
                          >
                            <Heart size={20} /> Terapiye Gir
                          </button>
                        </div>
                        
                        <div className="flex justify-center items-center mt-6">
                          <button
                            onClick={() => {
                              setWarningsShown(prev => ({ ...prev, resilience: true }));
                              setIsMentalBreakdown(false);
                              setGameState("HUB");
                            }}
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-semibold transition-all border border-slate-600"
                          >
                            Baskıyı Görmezden Gelip Devam Et
                          </button>
                        </div>
                      </div>
                    ) : isSuccessDrop ? (
                      <div className="bg-amber-950/40 p-8 md:p-12 rounded-[2.5rem] border border-amber-500/30 mb-8 backdrop-blur-xl text-center shadow-2xl shadow-amber-950/50">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/40">
                          <Star className="text-amber-400" size={32} />
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-4">
                          Kariyer Dipleri!
                        </h3>
                        <p className="text-amber-200 mb-8 leading-relaxed max-w-md mx-auto text-xs md:text-base">
                          Başarın tamamen sıfırlandı. Kimse seni hatırlamıyor. Eğer kurtarmak için bir şey yapmazsan unutulup gideceksin.
                        </p>
                        
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={takeSuccessRecovery}
                            disabled={recoveryCount.success >= 2}
                            className={`px-8 py-3 md:px-10 md:py-4 ${recoveryCount.success >= 2 ? 'bg-amber-900 opacity-50 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500'} text-white rounded-full font-bold transition-all shadow-lg shadow-amber-900/50 flex items-center gap-3 transform hover:scale-105 active:scale-95`}
                          >
                            <Activity size={20} />
                            {recoveryCount.success >= 2 ? "Bütün şanslarını tükettin" : `İmaj Kurtarma Çalışmalarına Başla (${2 - recoveryCount.success} hak kaldı)`}
                          </button>
                        </div>
                        
                        {recoveryCount.success >= 2 && (
                          <div className="flex justify-center items-center mt-6">
                            <button
                              onClick={() => {
                                setWarningsShown(prev => ({ ...prev, success: true }));
                                setIsSuccessDrop(false);
                                setGameState("HUB");
                              }}
                              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-semibold transition-all border border-slate-600"
                            >
                              Sıfır Başarıyla Devam Et
                            </button>
                          </div>
                        )}
                      </div>
                    ) : isTalentDrop ? (
                      <div className="bg-emerald-950/40 p-8 md:p-12 rounded-[2.5rem] border border-emerald-500/30 mb-8 backdrop-blur-xl text-center shadow-2xl shadow-emerald-950/50">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/40">
                          <Zap className="text-emerald-400" size={32} />
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-4">
                          Yetenek Tutulması!
                        </h3>
                        <p className="text-emerald-200 mb-8 leading-relaxed max-w-md mx-auto text-xs md:text-base">
                          Sahnede ne yapacağını unuttun. Yeteneğin köreldi. Eğer eğitim almazsan, bir dahaki performansında sahnede rezil olabilirsin.
                        </p>
                        
                        <div className="flex justify-center mb-4">
                          <button
                            onClick={takeTalentRecovery}
                            disabled={recoveryCount.talent >= 2}
                            className={`px-8 py-3 md:px-10 md:py-4 ${recoveryCount.talent >= 2 ? 'bg-emerald-900 opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'} text-white rounded-full font-bold transition-all shadow-lg shadow-emerald-900/50 flex items-center gap-3 transform hover:scale-105 active:scale-95`}
                          >
                            <Ruler size={20} />
                            {recoveryCount.talent >= 2 ? "Bütün şanslarını tükettin" : `Kampa Gir ve Çok Çalış (${2 - recoveryCount.talent} hak kaldı)`}
                          </button>
                        </div>
                        
                        {recoveryCount.talent >= 2 && (
                          <div className="flex justify-center items-center mt-6">
                            <button
                              onClick={() => {
                                setWarningsShown(prev => ({ ...prev, talent: true }));
                                setIsTalentDrop(false);
                                setGameState("HUB");
                              }}
                              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-semibold transition-all border border-slate-600"
                            >
                              Sıfır Yetenekle Devam Et
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                          {LOCATIONS.map((loc) => {
                            const isStage = loc.id === "stage";
                            const isStageAvailable = tasksCompletedInLevel >= 4;
                            const areStandardTasksAvailable =
                              tasksCompletedInLevel < 4;

                            let isDisabled = false;
                            if (isStage && !isStageAvailable) isDisabled = true;
                            if (!isStage && !areStandardTasksAvailable)
                              isDisabled = true;

                            let tooltipMsg = "";
                            if (isStage && !isStageAvailable)
                              tooltipMsg =
                                "Sahneye çıkmak için 4 görev tamamlamalısın.";
                            else if (!isStage && !areStandardTasksAvailable)
                              tooltipMsg =
                                "Eğitim tamamlandı. Sahneye çıkmalısın!";

                            return (
                              <button
                                key={loc.id}
                                onClick={() => {
                                  console.log("Button clicked:", loc.id, "isDisabled:", isDisabled);
                                  if (isDisabled) {
                                    setShowWarning(tooltipMsg);
                                    setTimeout(
                                      () => setShowWarning(null),
                                      3000,
                                    );
                                  } else {
                                    goToLocation(loc.id);
                                  }
                                }}
                                title={tooltipMsg}
                                className={`group relative overflow-hidden rounded-2xl md:rounded-3xl aspect-video ${loc.bgColor} border transition-all flex flex-col items-center justify-center gap-2 md:gap-4
                                ${isDisabled ? "opacity-30 grayscale cursor-not-allowed border-slate-700" : "border-white/5 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl shadow-lg"}
                              `}
                              >
                                {loc.imageUrl && (
                                  <div className="absolute inset-0 z-0">
                                    <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                                  </div>
                                )}
                                {!isDisabled && (
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 z-0"></div>
                                )}
                                {isDisabled && (
                                  <div className="absolute inset-0 bg-slate-900/80 z-0"></div>
                                )}

                                <span
                                  className={`relative z-10 ${loc.color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${isDisabled ? "text-slate-500" : "transform group-hover:scale-110 transition-transform duration-500 bg-black/30 p-3 rounded-full backdrop-blur-sm"}`}
                                >
                                  {loc.id === "room" && <Home size={28} />}
                                  {loc.id === "common" && <Users size={28} />}
                                  {loc.id === "vocal" && <Mic size={28} />}
                                  {loc.id === "dance" && <Activity size={28} />}
                                  {loc.id === "interview" && (
                                    <Camera size={28} />
                                  )}
                                  {loc.id === "stage" && <Star size={28} />}
                                </span>
                                <span
                                  className={`relative z-10 font-bold text-sm md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider ${isDisabled ? "text-slate-500" : "text-white/90 bg-black/30 px-3 py-1 rounded-xl backdrop-blur-sm"}`}
                                >
                                  {loc.name}
                                </span>
                                {loc.id === "room" && fanGifts.length > 0 && (
                                  <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[80%] justify-end z-20 pointer-events-none">
                                    {fanGifts.slice(-6).map((gift, idx) => (
                                      <div key={idx} className="bg-black/60 rounded-full p-1 text-sm shadow-md" title={gift.name}>
                                        {gift.icon}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <div className="mt-auto pt-10 pb-4 flex flex-col items-center gap-4">
                      <a
                        href="https://youtube.com/@muhendisinkitapligi?si=_KaPFhwIrFYRvrlx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white/30 hover:text-rose-400 transition-colors group"
                      >
                        <Youtube
                          size={16}
                          className="group-hover:scale-110 transition-transform text-rose-500/50 group-hover:text-rose-500"
                        />
                        <span className="text-[10px] font-medium tracking-tight">
                          Geliştiriciyi Destekle (YouTube)
                        </span>
                      </a>
                      <button
                        onClick={() => endGame(false, "Hesabını Kapattı")}
                        className="px-6 py-2 bg-rose-900/10 hover:bg-rose-900/30 rounded-full border border-rose-900/20 text-rose-400/60 hover:text-rose-300 text-[9px] font-bold tracking-widest uppercase transition-all"
                      >
                        Hesabını Kapat
                      </button>
                      <button
                        onClick={() => setIsLeaderboardOpen(true)}
                        className="px-6 py-2 bg-purple-900/10 hover:bg-purple-900/30 rounded-full border border-purple-900/20 text-purple-400/60 hover:text-purple-300 text-[9px] font-bold tracking-widest uppercase transition-all"
                      >
                        Puan Tablosu
                      </button>
                    </div>
                  </motion.div>
                )}

                {gameState === "LOCATION_VIEW" && selectedLocation && (
                  <motion.div
                    key="location_view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col h-full bg-slate-900/40 p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                       {selectedLocation === "room" && <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80" alt="room" className="w-full h-full object-cover" />}
                       {selectedLocation === "vocal" && <img src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80" alt="vocal" className="w-full h-full object-cover" />}
                       {selectedLocation === "dance" && <img src="https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80" alt="dance" className="w-full h-full object-cover" />}
                       {selectedLocation === "interview" && <img src="https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800&q=80" alt="interview" className="w-full h-full object-cover" />}
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
                       <h2 className="text-3xl md:text-5xl font-bold text-white tracking-widest uppercase drop-shadow-md">
                         {LOCATIONS.find(l => l.id === selectedLocation)?.name}
                       </h2>
                       
                       <div className="bg-slate-950/60 p-6 md:p-8 rounded-3xl backdrop-blur-md border border-white/10 w-full max-w-2xl text-center shadow-xl">
                         {selectedLocation === "room" && (
                           <div className="flex flex-col items-center gap-6">
                              <p className="text-slate-300 italic text-sm md:text-base">Kendi alanındasın. Dinlenebilir, yeteneğini veya psikolojini toparlayabilirsin.</p>
                              {fanGifts.length > 0 && (
                                <div className="flex flex-col gap-2 bg-pink-900/10 p-4 rounded-2xl w-full">
                                  <span className="text-pink-300 font-bold text-xs uppercase">Hayranlarından Gelenler</span>
                                  <div className="flex justify-center gap-4 text-2xl flex-wrap">
                                    {fanGifts.map((gift, i) => (
                                      <span key={i} title={gift.name}>{gift.icon}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex gap-4 flex-wrap justify-center w-full mt-4">
                                <button onClick={() => triggerLocationEvent('room')} className="flex-1 min-w-[200px] py-4 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2">
                                  <Activity size={20} />
                                  Etkinlik Yap / Odayı Topla
                                </button>
                              </div>
                           </div>
                         )}

                         {selectedLocation === "vocal" && (
                           <div className="flex flex-col items-center gap-6">
                             <p className="text-slate-300 italic text-sm md:text-base">Vokal stüdyosundasın. Ses tellerin ısınsın!</p>
                             <div className="flex gap-4 flex-wrap justify-center w-full mt-4">
                               <button onClick={() => setGameState('MINIGAME_VOCAL')} className="flex-1 min-w-[200px] py-4 px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2">
                                 <Zap size={20} />
                                 Başarı & Yetenek Çalıştır
                               </button>
                               <button onClick={() => triggerLocationEvent('vocal')} className="flex-1 min-w-[200px] py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2">
                                 <Mic size={20} />
                                 Eğitmenin Sorusunu Cevapla
                               </button>
                             </div>
                           </div>
                         )}

                         {selectedLocation === "dance" && (
                           <div className="flex flex-col items-center gap-6">
                             <p className="text-slate-300 italic text-sm md:text-base">Dans stüdyosundasın. Aynaların önünde koreografini çalış.</p>
                             <div className="flex gap-4 flex-wrap justify-center w-full mt-4">
                               <button onClick={() => setGameState('MINIGAME_DANCE')} className="flex-1 min-w-[200px] py-4 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2">
                                 <Zap size={20} />
                                 Başarı & Yetenek Çalıştır
                               </button>
                               <button onClick={() => triggerLocationEvent('dance')} className="flex-1 min-w-[200px] py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2">
                                 <Activity size={20} />
                                 Eğitmenin Sorusunu Cevapla
                               </button>
                             </div>
                           </div>
                         )}

                         {selectedLocation === "interview" && (
                           <div className="flex flex-col items-center gap-6">
                             <p className="text-slate-300 italic text-sm md:text-base">Kamera önündesin. Tüm gözler senin üzerinde!</p>
                             <div className="flex gap-4 flex-wrap justify-center w-full mt-4">
                               <button onClick={() => triggerLocationEvent('interview')} className="flex-1 min-w-[200px] py-4 px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/50 flex items-center justify-center gap-2">
                                 <Camera size={20} />
                                 Kayıt Başlasın (Mülakat)
                               </button>
                             </div>
                           </div>
                         )}

                         <div className="mt-8 border-t border-white/10 pt-6">
                           <button onClick={() => { setGameState("HUB"); setSelectedLocation(null); }} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-semibold transition-all border border-slate-600 hover:scale-105 active:scale-95">
                             Lobiye Geri Dön
                           </button>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {gameState === "MINIGAME_VOCAL" && (
                  <motion.div
                    key="minigame_vocal"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-50 p-4"
                  >
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                    <div className="relative z-10 w-full max-w-md">
                      <VocalMinigame onComplete={(success) => {
                        if (success) {
                          applyStatChanges({ success: 10, talent: 15 });
                          setEventMessage("Vokal antrenmanı harikaydı! Sesin günden güne güzelleşiyor.");
                        } else {
                          applyStatChanges({ health: -10, talent: -5 });
                          setEventMessage("Vokal çalışırken boğazını zorladın. Biraz detone oldun.");
                        }
                        setTasksCompletedInLevel((prev) => Math.min(4, prev + 1));
                        setGameState("RESULT");
                      }} />
                    </div>
                  </motion.div>
                )}

                {gameState === "MINIGAME_DANCE" && (
                  <motion.div
                    key="minigame_dance"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-50 p-4"
                  >
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                    <div className="relative z-10 w-full max-w-md">
                      <DanceMinigame onComplete={(success) => {
                        if (success) {
                          applyStatChanges({ success: 10, talent: 15 });
                          setEventMessage("Harika bir koreografi ezberi! Seyirciler sahnede büyülenecek.");
                        } else {
                          applyStatChanges({ health: -10, talent: -5 });
                          setEventMessage("Ayakların birbirine dolandı! Koreografi üzerinde daha çok çalışmalısın.");
                        }
                        setTasksCompletedInLevel((prev) => Math.min(4, prev + 1));
                        setGameState("RESULT");
                      }} />
                    </div>
                  </motion.div>
                )}

                {gameState === "EVENT" && (
                  <motion.div
                    key="event"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-50 p-4"
                  >
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                    <div className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-slate-900 p-6 md:p-10 rounded-[2rem] border border-slate-700 shadow-2xl shadow-purple-900/20">
                      {isLoadingEvent ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-10">
                          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                          <p className="text-slate-300 font-bold tracking-widest uppercase text-sm animate-pulse">
                            Kameralar kayıtta...
                          </p>
                        </div>
                      ) : (
                        currentEvent && (
                          <>
                            <div className="flex justify-center mb-6">
                              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                <Activity size={24} />
                              </div>
                            </div>
                            <p className="text-lg md:text-xl text-center mb-10 text-slate-200 leading-relaxed font-medium">
                              {replacePlaceholders(currentEvent.description)}
                            </p>
                            <div className="flex flex-col gap-4">
                              {"choices" in currentEvent &&
                                currentEvent.choices.map((choice, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleChoice(
                                        choice.effects,
                                        choice.message,
                                        currentEvent.location === "stage",
                                        "traitResponse" in choice
                                          ? (choice as any).traitResponse
                                          : undefined,
                                        choice.text,
                                        choice.socialFeedback,
                                        choice.traitTag,
                                      )
                                    }
                                    className="w-full text-left p-5 rounded-2xl bg-slate-800/50 hover:bg-indigo-500/20 border border-slate-700 hover:border-indigo-500/50 transition-all hover:-translate-y-1 text-slate-200 shadow-sm"
                                  >
                                    {choice.text}
                                  </button>
                                ))}
                            </div>
                          </>
                        )
                      )}
                    </div>
                  </motion.div>
                )}

                {gameState === "RESULT" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-50 p-4"
                  >
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                    <div className="relative z-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-center bg-slate-900 p-8 md:p-12 rounded-[2rem] border border-slate-700 shadow-2xl shadow-purple-900/20">
                      <p className="text-xl md:text-2xl text-slate-200 mb-10 leading-relaxed font-medium whitespace-pre-line">
                        {eventMessage}
                      </p>

                      {lynchReason ? (
                        <button
                          onClick={() => {
                            setGameState("SOCIAL_MEDIA");
                            setLynchReason(null);
                          }}
                          className="px-8 py-4 bg-rose-700 hover:bg-rose-600 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/50 flex items-center gap-2 mx-auto"
                        >
                          <Smartphone size={20} /> Sosyal Medya'ya Bak
                        </button>
                      ) : (
                        <button
                          onClick={() => setGameState("HUB")}
                          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/50 flex items-center gap-2 mx-auto"
                        >
                          Devam Et <ChevronRight size={20} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {gameState === "LYNCH" && (
                  <motion.div
                    key="lynch"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 flex justify-center items-center z-[100] overflow-hidden p-2 md:p-4 gap-4"
                  >
                    <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-lg"></div>

                    <div className="hidden lg:flex flex-col gap-4 w-[300px] h-full overflow-hidden relative z-10 py-4 justify-end shrink-0">
                      <AnimatePresence>
                        {activeLynchComments
                          .filter((c) => c.x < 50)
                          .map((comment, i) => {
                            const userName =
                              MOCK_USERS[(i * 3) % MOCK_USERS.length];
                            const displayUserName = userName.startsWith("@")
                              ? userName
                              : `@${userName}`;
                            return (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring" }}
                                className="bg-rose-900/60 p-4 md:p-5 rounded-2xl border border-rose-500/40 text-rose-100 shadow-[0_4px_20px_rgba(225,29,72,0.3)] backdrop-blur-md"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-5 h-5 rounded-full bg-rose-600 animate-pulse"></div>
                                  <span className="font-bold text-rose-300 text-sm">
                                    {displayUserName}
                                    {Math.floor(Math.random() * 999)}
                                  </span>
                                </div>
                                <p className="font-bold text-base md:text-lg italic leading-snug text-white">
                                  "{comment.text}"
                                </p>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                    </div>

                    <div className="lg:hidden fixed top-0 left-0 right-0 min-h-[4rem] bg-rose-950/95 backdrop-blur-xl border-b border-rose-500/50 flex items-center px-4 overflow-hidden z-[110] pt-safe shadow-[0_4px_20px_rgba(225,29,72,0.4)]">
                      <AnimatePresence mode="wait">
                        {activeLynchComments.length > 0 &&
                          (() => {
                            const lastComment =
                              activeLynchComments[
                                activeLynchComments.length - 1
                              ];
                            const rawName =
                              MOCK_USERS[
                                activeLynchComments.length % MOCK_USERS.length
                              ];
                            const dName = rawName.startsWith("@")
                              ? rawName
                              : `@${rawName}`;

                            const shortText =
                              lastComment.text.length > 55
                                ? lastComment.text.substring(0, 55).trim() +
                                  "..."
                                : lastComment.text;

                            return (
                              <motion.div
                                key={lastComment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-full flex flex-row items-center gap-2 overflow-hidden py-2 mt-4"
                              >
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></div>
                                <div className="flex items-center gap-1.5 w-full whitespace-nowrap overflow-hidden">
                                  <span className="font-bold text-rose-300 text-[11px] sm:text-xs shrink-0">
                                    {dName}
                                    {Math.floor(Math.random() * 999)}:
                                  </span>
                                  <span className="text-rose-50 text-[11px] sm:text-xs font-medium truncate">
                                    "{shortText}"
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })()}
                      </AnimatePresence>
                    </div>

                    <div className="relative z-20 max-w-2xl w-full max-h-[85vh] mt-12 lg:mt-0 flex flex-col bg-rose-950/70 rounded-[2.5rem] border border-rose-500/60 shadow-[0_0_100px_rgba(225,29,72,0.5)] backdrop-blur-xl shrink-1">
                      <div className="flex-1 overflow-y-auto w-full p-6 md:p-10 scrollbar-thin scrollbar-thumb-rose-700/50 rounded-[2.5rem] relative">
                        <div className="relative z-10">
                          <div className="flex items-center justify-center gap-2 md:gap-3 text-rose-500 mb-8">
                            <AlertTriangle
                              size={28}
                              className="md:w-10 md:h-10 shrink-0 animate-pulse"
                            />
                            <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-center">
                              LİNÇ MODU AKTİF
                            </h2>
                            <AlertTriangle
                              size={28}
                              className="md:w-10 md:h-10 shrink-0 animate-pulse"
                            />
                          </div>

                          {lynchReason && (
                            <div className="bg-rose-900/40 p-5 rounded-2xl border border-rose-500/30 mb-8 flex items-start gap-4 shadow-inner">
                              <span className="text-rose-400 font-bold mt-1 shrink-0 bg-rose-950 px-3 py-1 rounded-lg text-sm border border-rose-800">
                                Neden?
                              </span>
                              <p className="text-rose-100 text-sm md:text-base leading-relaxed">
                                {replacePlaceholders(lynchReason)}
                              </p>
                            </div>
                          )}

                          <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 mb-10 italic text-slate-300 text-center text-lg md:text-xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                            <span className="text-slate-500 font-serif text-5xl leading-none absolute top-4 left-6 opacity-30">
                              "
                            </span>
                            <div className="relative z-10 px-6">
                              {currentQuote.quote}
                            </div>
                            <span className="text-slate-500 font-serif text-5xl leading-none absolute bottom-0 right-6 opacity-30 align-bottom">
                              "
                            </span>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 mt-6 relative z-10 font-sans not-italic uppercase tracking-widest">
                               {currentQuote.author && (
                                 <span className="text-xs text-indigo-400 font-bold">— {currentQuote.author}</span>
                               )}
                               {currentQuote.author && currentQuote.book && (
                                 <span className="text-indigo-400/50 hidden sm:inline">|</span>
                               )}
                               {currentQuote.book && (
                                 <span className="text-[10px] text-slate-500 font-semibold">{currentQuote.book}</span>
                               )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 pb-4">
                            {currentQuote.choices.map((choice, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  const difficultyMultiplier =
                                    level <= 2 ? 1 : level <= 4 ? 1.5 : 2;
                                  const scaledEffects = Object.fromEntries(
                                    Object.entries(choice.effects).map(
                                      ([key, val]) => [
                                        key,
                                        val && val < 0
                                          ? Math.floor(val * difficultyMultiplier)
                                          : val,
                                      ],
                                    ),
                                  );

                                  applyStatChanges(
                                    scaledEffects,
                                    choice.text,
                                  );
                                  setEventMessage(choice.message);
                                  setTasksCompletedInLevel((prev) => Math.min(4, prev + 1));
                                  setGameState("RESULT");
                                }}
                                className="w-full text-left p-5 rounded-2xl bg-rose-900/30 hover:bg-rose-600/40 border border-rose-800 hover:border-rose-500 transition-all hover:scale-[1.02] text-rose-100 shadow-sm"
                              >
                                {choice.text}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-4 w-[300px] h-full overflow-hidden relative z-10 py-4 justify-end shrink-0">
                      <AnimatePresence>
                        {activeLynchComments
                          .filter((c) => c.x >= 50)
                          .map((comment, i) => {
                            const userName =
                              MOCK_USERS[(i * 7 + 2) % MOCK_USERS.length];
                            const displayUserName = userName.startsWith("@")
                              ? userName
                              : `@${userName}`;
                            return (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring" }}
                                className="bg-rose-900/60 p-4 md:p-5 rounded-2xl border border-rose-500/40 text-rose-100 shadow-[0_4px_20px_rgba(225,29,72,0.3)] backdrop-blur-md"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-5 h-5 rounded-full bg-rose-600 animate-pulse"></div>
                                  <span className="font-bold text-rose-300 text-sm">
                                    {displayUserName}
                                    {Math.floor(Math.random() * 999)}
                                  </span>
                                </div>
                                <p className="font-bold text-base md:text-lg italic leading-snug text-white">
                                  "{comment.text}"
                                </p>
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {gameState === "GAMEOVER" && (
                  <motion.div
                    key="gameover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-50"
                  >
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
                    <div className="relative z-10 max-w-2xl w-[95%]">
                      <div className="bg-slate-900/90 p-8 rounded-3xl border border-slate-700/50 text-center shadow-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-200 mb-6 font-serif tracking-widest uppercase drop-shadow-md">
                          <span className="text-rose-500 block text-2xl mb-2">OYUN BİTTİ</span>
                          {ENDINGS[winEnding as keyof typeof ENDINGS]?.title || "MÜCADELE SONA ERDİ"}
                        </h2>
                        <p className="text-xl text-slate-300 mb-4 leading-relaxed">
                          {ENDINGS[winEnding as keyof typeof ENDINGS]?.desc || "Sosyal medyanın ve müzik sektörünün nefes kesici hızında kayboldun. Ne yazık ki bu zorlu yolculuğa daha fazla dayanamadın..."}
                        </p>
                        <div className="text-3xl font-bold text-amber-400 mb-2 font-mono border-y border-white/10 py-4">
                          Skor: {Math.round(score)}
                        </div>
                        <div className="text-xl text-rose-300 font-mono mb-6">
                          👥 {fanCount.toLocaleString()} takipçi
                          <div className="text-sm mt-1 text-slate-400 font-sans">
                            {fanCount > 10000
                              ? "🏆 Gerçek bir fenomen oldun"
                              : fanCount < 1000
                                ? "Kimse seni tanımıyordu..."
                                : "Ortalama bir iz bıraktın..."}
                          </div>
                        </div>

                        <div className="bg-black/30 rounded-2xl p-4 mb-6 max-h-48 overflow-y-auto">
                          <h3 className="text-xl font-bold mb-4 text-white">
                            Liderlik Tablosu
                          </h3>
                          <div className="flex flex-col gap-2">
                            {leaderboard.map((u, i) => (
                              <div
                                key={i}
                                className={`flex justify-between items-center p-2 rounded-lg ${u.name === (playerName || "Anonim") ? "bg-purple-900/50 border border-purple-500/50" : "bg-slate-800/50"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-slate-400 w-4">
                                    {i + 1}.
                                  </span>
                                  <span className="font-bold text-slate-100">
                                    {u.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-slate-400 truncate max-w-[100px]">
                                    {u.status}
                                  </span>
                                  <span className="font-mono text-amber-400 font-bold">
                                    {u.score}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                          <button
                            onClick={() =>
                              window.open("https://youtube.com", "_blank")
                            }
                            className="px-6 py-3 bg-red-600 rounded-full font-bold text-white hover:bg-red-500 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Youtube size={18} /> Kanala Abone Ol
                          </button>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-slate-700 rounded-full font-bold text-white hover:bg-slate-600 transition-colors w-full sm:w-auto"
                          >
                            Yeniden Başla
                          </button>
                          <button
                            onClick={shareApp}
                            className="px-6 py-3 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Share2 size={18} /> Arkadaşlarınla Paylaş
                          </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                          <a
                            href="https://youtube.com/@muhendisinkitapligi?si=_KaPFhwIrFYRvrlx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-white/60 hover:text-rose-400 transition-colors group"
                          >
                            <Youtube
                              size={20}
                              className="group-hover:scale-110 transition-transform"
                            />
                            <span className="text-sm font-medium">
                              Bize Destek Ol (YouTube)
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {gameState === "WIN" && (
                  <motion.div
                    key="win"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-50"
                  >
                    <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md"></div>
                    <div className="relative z-10 max-w-2xl w-[95%]">
                      <div className="bg-emerald-900/90 p-8 rounded-3xl border border-emerald-700/50 text-center shadow-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-emerald-100 mb-6 font-serif tracking-widest uppercase drop-shadow-md">
                          <span className="text-emerald-400 block text-2xl mb-2">KAZANDIN</span>
                          {ENDINGS[winEnding as keyof typeof ENDINGS]?.title || "HİKAYENİN SONU"}
                        </h2>
                        <p className="text-xl text-emerald-200 mb-4 leading-relaxed">
                          {ENDINGS[winEnding as keyof typeof ENDINGS]?.desc}
                        </p>
                        <div className="text-3xl font-bold text-yellow-400 mb-2 font-mono border-y border-emerald-700/50 py-4">
                          Skor: {Math.round(score)}
                        </div>
                        <div className="text-xl text-rose-200 font-mono mb-6">
                          👥 {fanCount.toLocaleString()} takipçi
                          <div className="text-sm mt-1 text-emerald-200/70 font-sans">
                            {fanCount > 10000
                              ? "🏆 Gerçek bir fenomen oldun"
                              : fanCount < 1000
                                ? "Kimse seni tanımıyordu ama başardın..."
                                : "Takipçilerin seni çok seviyor!"}
                          </div>
                        </div>

                        <div className="bg-black/30 rounded-2xl p-4 mb-6 max-h-48 overflow-y-auto border border-emerald-900/30">
                          <h3 className="text-xl font-bold mb-4 text-white">
                            Liderlik Tablosu
                          </h3>
                          <div className="flex flex-col gap-2">
                            {leaderboard.map((u, i) => (
                              <div
                                key={i}
                                className={`flex justify-between items-center p-2 rounded-lg ${u.name === (playerName || "Anonim") ? "bg-purple-900/50 border border-purple-500/50" : "bg-emerald-950/50"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-emerald-600/50 w-4">
                                    {i + 1}.
                                  </span>
                                  <span className="font-bold text-emerald-100">
                                    {u.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-emerald-400 truncate max-w-[100px]">
                                    {u.status}
                                  </span>
                                  <span className="font-mono text-yellow-400 font-bold">
                                    {u.score}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                          <button
                            onClick={() =>
                              window.open("https://youtube.com", "_blank")
                            }
                            className="px-6 py-3 bg-red-600 rounded-full font-bold text-white hover:bg-red-500 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Youtube size={18} /> Kanala Abone Ol
                          </button>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-emerald-700 rounded-full font-bold text-white hover:bg-emerald-600 transition-colors w-full sm:w-auto"
                          >
                            Yeniden Başla
                          </button>
                          <button
                            onClick={shareApp}
                            className="px-6 py-3 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Share2 size={18} /> Arkadaşlarınla Paylaş
                          </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-emerald-800/50">
                          <a
                            href="https://youtube.com/@muhendisinkitapligi?si=_KaPFhwIrFYRvrlx"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-emerald-400/60 hover:text-rose-400 transition-colors group"
                          >
                            <Youtube
                              size={20}
                              className="group-hover:scale-110 transition-transform"
                            />
                            <span className="text-sm font-medium">
                              Bize Destek Ol (YouTube)
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {gameState === "SOCIAL_MEDIA" && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-40 p-2 md:p-4"
                  >
                    <div className="w-full max-w-md h-full max-h-[90vh] bg-slate-950 rounded-[2.5rem] border-[6px] md:border-[8px] border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative text-slate-50">
                      <div className="bg-slate-900/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/5 z-10 sticky top-0">
                        <button
                          onClick={() => setGameState("HUB")}
                          className="text-purple-300 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <div className="font-bold text-slate-100 flex items-center gap-2 tracking-wide">
                          <Smartphone size={16} /> Akış
                          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-purple-300">
                            {fanCount.toLocaleString()} t.
                          </span>
                        </div>
                        <div className="w-8 h-8"></div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-20">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg mb-4">
                          <p className="text-sm font-semibold text-indigo-200 mb-3">Hayranlarından posta kutunda yeni bir mektup olabilir!</p>
                          <button
                            onClick={async () => {
                              setIsGeneratingLetter(true);
                              try {
                                const response = await fetch('/api/generate-fan-letter', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ characterName: character?.name, trait: character?.trait, level })
                                });
                                if (response.ok) {
                                  const contentType = response.headers.get("content-type");
                                  if (contentType && contentType.includes("application/json")) {
                                    const data = await response.json();
                                    setLetters(prev => [{ text: data.letter, user: "Anonim Hayran" }, ...prev]);
                                    setFanGifts(prev => [...prev, { name: data.giftName, icon: data.giftEmoji }]);
                                    alert(`Yeni bir hediye aldın: ${data.giftEmoji} ${data.giftName}\nOdadan görebilirsin!`);
                                  }
                                }
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsGeneratingLetter(false);
                              }
                            }}
                            disabled={isGeneratingLetter}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            {isGeneratingLetter ? "Mektup Açılıyor..." : "💌 Mektubu Oku (AI)"}
                          </button>
                          
                          {letters.length > 0 && (
                            <div className="mt-4 p-3 bg-white/5 rounded-2xl text-left border border-white/5 w-full">
                              <p className="text-xs text-indigo-300 font-bold mb-1">Son Gelen Mektup:</p>
                              <p className="text-sm text-slate-300 italic">" {letters[0].text} "</p>
                            </div>
                          )}
                        </div>

                        {socialComments.length === 0 ? (
                          <div className="text-center text-purple-300/50 mt-10">
                            Henüz yorum yok...
                          </div>
                        ) : (
                          socialComments.map((comment) => (
                            <div
                              key={comment.id}
                              className={`p-4 rounded-2xl ${comment.isPositive ? "bg-purple-900/20 border-purple-500/20" : "bg-rose-900/20 border-rose-500/20"} border`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span
                                  className={`font-semibold text-sm ${comment.isPositive ? "text-purple-200" : "text-rose-200"}`}
                                >
                                  {comment.user}
                                </span>
                                <span className="text-xs opacity-50">
                                  {comment.time}
                                </span>
                              </div>
                              <p
                                className={`${comment.isPositive ? "text-purple-50" : "text-rose-50"} text-sm`}
                              >
                                {comment.text}
                              </p>

                              {comment.analysisNote && (
                                <p className="text-[10px] text-rose-400 mt-2 italic bg-rose-950/50 p-2 rounded border border-rose-800/30">
                                  Analiz: {comment.analysisNote}
                                </p>
                              )}

                              {!comment.isPositive && !comment.actionTaken && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => {
                                        applyStatChanges({ resilience: -5 });
                                        setFanCountSafe((prev) => prev - 30);
                                        setSocialComments(prev => prev.map(c => c.id === comment.id ? { ...c, actionTaken: 'blocked' } : c));
                                    }}
                                    className="text-[10px] bg-rose-900 border border-rose-700 text-white px-2 py-1 rounded hover:bg-rose-800"
                                  >
                                    Tepki Göster (-Psikoloji)
                                  </button>
                                  <button
                                    onClick={() => {
                                        applyStatChanges({ success: 5 });
                                        setFanCountSafe((prev) => prev + 20);
                                        setSocialComments(prev => prev.map(c => c.id === comment.id ? { ...c, actionTaken: 'calmed' } : c));
                                    }}
                                    className="text-[10px] bg-sky-900 border border-sky-700 text-white px-2 py-1 rounded hover:bg-sky-800"
                                  >
                                    Baş Et (+Başarı)
                                  </button>
                                </div>
                              )}
                              
                              {!comment.isPositive && comment.actionTaken && (
                                <div className="mt-3 text-[10px] font-bold px-2 py-1 rounded bg-slate-800 inline-block text-slate-400 border border-slate-700">
                                  {comment.actionTaken === 'blocked' ? '🚫 Engellendi' : '✨ Baş Edildi!'}
                                </div>
                              )}

                              <div className="flex items-center gap-1 mt-3 opacity-60 text-xs">
                                <Heart
                                  size={16}
                                  className={`cursor-pointer ${comment.liked ? "text-rose-500 fill-rose-500" : "text-white"}`}
                                  onClick={() => toggleLike(comment.id)}
                                />
                                <span className="text-xs">{comment.likes || 0}</span>
                                {comment.isPositive && !comment.replied && (
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleReply(comment.id, true)}
                                      className="text-[10px] bg-purple-900 border border-purple-700 text-white px-2 py-1 rounded"
                                    >
                                      Teşekkürler
                                    </button>
                                    <button
                                      onClick={() => handleReply(comment.id, true)}
                                      className="text-[10px] bg-purple-900 border border-purple-700 text-white px-2 py-1 rounded"
                                    >
                                      Sevgiler
                                    </button>
                                  </div>
                                )}
                              </div>
                              {comment.replied && (
                                <div className="mt-3 p-3 bg-purple-950/40 rounded-xl border border-purple-500/30">
                                  <p className="text-xs text-purple-300 italic">
                                    <span className="font-bold text-purple-400">{comment.user}: </span>
                                    {comment.fanReply || "Oha yorumumu beğendi! Seni çok seviyorum!"}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {stats.resilience <= 40 && (
                        <div
                          className="absolute bottom-4 left-4 right-4 bg-rose-950 border border-rose-600 rounded-xl p-3 shadow-lg flex items-center justify-between cursor-pointer"
                          onClick={() => triggerLynch()}
                        >
                          <span className="text-rose-200 text-xs font-semibold flex items-center gap-2">
                            <AlertTriangle size={14} /> Linç artıyor!
                          </span>
                          <span className="text-[10px] bg-rose-600 px-2 py-1 rounded text-white font-bold">
                            Kafaya Takma &rarr;
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {gameState === "CINEMATIC" && currentCinematic && postCinematicCallback && (
                  <Suspense fallback={<div className="absolute inset-0 bg-black z-50 flex items-center justify-center"><div className="animate-spin text-white">Yükleniyor...</div></div>}>
                    <CinematicPlayer 
                      type={currentCinematic} 
                      onComplete={() => {
                        postCinematicCallback();
                        setPostCinematicCallback(null);
                        setCurrentCinematic(null);
                      }} 
                    />
                  </Suspense>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTrait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 md:p-6"
            onClick={() => setSelectedTrait(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="holo-panel w-full max-w-md max-h-[90vh] overflow-y-auto p-6 flex flex-col items-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTrait(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X />
              </button>
              {selectedTrait.path ? (
                <img
                  src={selectedTrait.path}
                  loading="lazy"
                  className="w-56 h-56 rounded-full border-4 border-purple-500/50 object-cover mb-6"
                  alt={selectedTrait.value}
                />
              ) : (
                <div className="w-56 h-56 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center mb-6">
                  <span className="text-slate-500 text-lg">N/A</span>
                </div>
              )}
              <h3 className="text-purple-300 font-bold text-2xl mb-1">
                {selectedTrait.label}
              </h3>
              <span className="text-slate-100 text-lg">
                {selectedTrait.value}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatBar({
  icon,
  label,
  value,
  color,
  attempts,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  attempts: number;
}) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md p-3 md:p-5 rounded-2xl md:rounded-3xl border border-white/5 shadow-inner shadow-white/5 flex flex-col justify-center relative">
      {attempts === 0 && (
        <div className="absolute top-2 right-2 text-rose-500 animate-pulse">
          <AlertCircle size={16} />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2 md:mb-3 text-slate-200">
        <div className="p-1 md:p-1.5 bg-white/5 rounded-lg md:rounded-xl shadow-sm">
          {icon}
        </div>
        <span className="font-semibold text-[10px] md:text-sm tracking-widest uppercase truncate">
          {label} (Kalan: {attempts})
        </span>
      </div>
      <div className="h-1.5 md:h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          className={`absolute top-0 left-0 bottom-0 ${color}`}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>
      <div className="text-right mt-1 md:mt-2 text-[8px] md:text-[10px] text-slate-400 font-mono tracking-widest">
        {value}%
      </div>
    </div>
  );
}

function InteractiveTraitCard({
  label,
  value,
  onNext,
  onPrev,
  icon: Icon,
}: any) {
  return (
    <div className="holo-panel flex flex-col items-center justify-center p-3 md:p-6 relative group overflow-hidden hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20 rounded-2xl md:rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/5">
      <span className="text-purple-300 font-bold text-[11px] md:text-xs tracking-widest uppercase mb-3 md:mb-4 text-center z-10">
        {label}
      </span>

      <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center mb-4 md:mb-5 shrink-0 overflow-hidden group-hover:border-purple-400/80 transition-colors z-10 shadow-inner">
        {Icon ? (
          <Icon
            size={40}
            className="text-slate-500 group-hover:text-purple-400 transition-colors"
          />
        ) : (
          <User size={40} className="text-slate-500" />
        )}
      </div>

      <div className="flex items-center w-full justify-between gap-2 md:gap-3 z-10 px-1 md:px-2 mt-auto">
        <button
          onClick={onPrev}
          className="shrink-0 p-2 md:p-2.5 bg-slate-950/80 hover:bg-purple-600 rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-md border border-white/5"
        >
          <ChevronLeft size={18} />
        </button>
        <div
          className="flex-1 flex justify-center items-center min-h-[2.5rem] px-1"
          title={value}
        >
          <span className="text-slate-100 font-bold text-[10px] sm:text-xs md:text-sm text-center leading-snug line-clamp-2 md:line-clamp-1">
            {value}
          </span>
        </div>
        <button
          onClick={onNext}
          className="shrink-0 p-2 md:p-2.5 bg-slate-950/80 hover:bg-purple-600 rounded-full text-white transition-all hover:scale-110 active:scale-95 shadow-md border border-white/5"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
