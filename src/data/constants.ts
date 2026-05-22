import { Character, Stats } from '../types';
import encodedData from './encoded_constants.json';
import { d } from '../lib/utils';

export const GENDERS = ["Kadın", "Erkek", "Belirtmek İstemiyor"];
export const NAMES = ["Athena", "Apollo", "Artemis", "Ares", "Aphrodite", "Hermes", "Dionysus", "Hades", "Persephone", "Nyx", "Eros", "Hecate", "Zeus", "Hera", "Poseidon", "Demeter", "Iris", "Pan", "Nemesis", "Leto", "Selene", "Helios", "Eos", "Kratos", "Nike"];
export const HAIR_COLORS = ["Gece Mavisi", "Gümüş Gri", "Platin Sarı", "Kızıl", "Kömür Siyahı", "Kahve", "Pastel Pembe", "Neon Yeşil"];
export const CLOTHING_STYLES = ["Sokak Modası", "Kawaii", "Gotik", "Minimalist", "Spor", "Avangart", "Y2K", "Oversize"];
export const VOCAL_TONES = ["Eşsiz ve Buğulu", "Güçlü ve Yüksek", "Yumuşak ve Ritmik", "Duygulu ve Akustik", "Enerjik Pop", "Derin Bas"];
export const DANCE_STYLES = ["Keskin Hip-Hop", "Akıcı Modern Dans", "Güçlü K-Pop", "Zarif Bale Temelli", "Serbest Stil", "Tembel"];
export const PERSONALITY_TRAITS = ["Sempatik ve Neşeli", "Soğuk ve Özgüvenli", "Melankolik ve Sanatsal", "Sessiz ve Kararlı", "Agresif ve Hırslı", "Masum ve Şaşkın", "Lider Ruhlu", "Gizemli ve İçe Dönük", "Mükemmeliyetçi", "Umursamaz ve Rahat", "İsyankar"];
export const PHYSICAL_TRAITS = ["Keskin Yüz Hatlı", "Aura Sahibi", "Karizmatik", "Dövme Kaplı", "Soğuk Bakışlı", "Şirin Görünümlü"];
export const HEIGHTS = ["1.70", "1.75", "1.80", "1.85", "1.90", "1.95"];
export const BODY_TYPES = ["Geniş Omuzlu", "Atletik & Kaslı", "İnce & Zarif", "Zayıf & Narin"];

export const FAN_REPLY_ALTERNATIVES = [
  "Oha yorumumu beğendi! Seni çok seviyorum!",
  "İnanamıyorum, cevap verdin! Kalpten gidiyorum ❤️",
  "Sen bir harikasın, hep arkandayım!",
  "Bunu ekran görüntüsü alıp odama asıcam!",
  "Cevabın günümü güzelleştirdi, çok teşekkürler!",
  "Senin kadar mütevazı bir idol görmedim.",
  "Sesini duyarken bile heyecanlanıyorum, teşekkürler!",
  "Resmen seninle konuşuyorum, şoktayım!",
  "Cevabın için teşekkürler, başarılarının devamını dilerim!",
  "Senin kalbin de yeteneğin kadar güzel.",
  "İyi ki seni tanımışım, harikasın!",
  "Yorumumu farketmen bile bana yetti, sağ ol!",
  "Gözlerim doldu, çok teşekkür ederim!",
  "Senin gibi bir idolüm olduğu için çok şanslıyım.",
  "Bu cevabı saklayıp ömür boyu bakacam!",
  "Mükemmel bir enerji yayıyorsun, cevabın yeter!",
  "İnanılmaz birisin, desteğim hep seninle!",
  "Yorumuma değer verip cevapladığın için teşekkürler!",
  "Kalbim küt küt atıyor şu an, harikasın!",
  "Seninle etkileşime geçmek hayalimdi, teşekkürler!"
];

export const COMMENT_TEMPLATES = {
  positive: encodedData.positive,
  negative: encodedData.negative,
  lynch_scrolling: encodedData.lynch_scrolling
};


export const MOCK_USERS = ["@idol_lover12", "@loveflower_x", "@musicgeek", "@stan_account_tr", "@pop_drama", "@dance_critic", "@just_vibes", "@realist_fan"];

export const LOCATIONS = [
  { id: 'room', name: 'Kendi Odan', bgColor: 'bg-[#2A2344]', color: 'text-purple-300', icon: 'Home', imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80' },
  { id: 'common', name: 'Ortak Alan', bgColor: 'bg-[#4A3B32]', color: 'text-orange-300', icon: 'Users', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80' },
  { id: 'vocal', name: 'Vokal Odası', bgColor: 'bg-[#3A2A44]', color: 'text-pink-300', icon: 'Mic', imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80' },
  { id: 'dance', name: 'Dans Odası', bgColor: 'bg-[#213F3D]', color: 'text-emerald-300', icon: 'Activity', imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&q=80' },
  { id: 'interview', name: 'Kamera Önü', bgColor: 'bg-[#233A4F]', color: 'text-sky-300', icon: 'Camera', imageUrl: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&q=80' },
  { id: 'stage', name: 'Sahne', bgColor: 'bg-[#4F232B]', color: 'text-rose-300', icon: 'Star', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c092dbcb58f?w=400&q=80' }
];

export const INITIAL_STATS: Stats = {
  health: 80,
  resilience: 70,
  success: 20,
  talent: 30
};
