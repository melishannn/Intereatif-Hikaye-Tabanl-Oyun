import { Character, Stats } from '../types';
import encodedData from './encoded_constants.json';
import { d } from '../lib/utils';

export const NAMES = ["Ali", "Can", "Leo", "Jack", "Kerem", "Cem", "Emre", "Nick", "Minho", "Eren", "Cenk", "Julian", "Deniz", "Alp", "Kıvanç", "Jin"];
export const HAIR_COLORS = ["Gece Mavisi", "Gümüş Gri", "Platin Sarı", "Kızıl", "Kömür Siyahı", "Kahve", "Pastel Pembe", "Neon Yeşil"];
export const CLOTHING_STYLES = ["Sokak Modası", "Kawaii", "Gotik", "Minimalist", "Spor", "Avangart", "Y2K", "Oversize"];
export const VOCAL_TONES = ["Eşsiz ve Buğulu", "Güçlü ve Yüksek", "Yumuşak ve Ritmik", "Duygulu ve Akustik", "Enerjik Pop", "Derin Bas"];
export const DANCE_STYLES = ["Keskin Hip-Hop", "Akıcı Modern Dans", "Güçlü K-Pop", "Zarif Bale Temelli", "Serbest Stil", "Tembel"];
export const PERSONALITY_TRAITS = ["Sempatik ve Neşeli", "Soğuk ve Özgüvenli", "Melankolik ve Sanatsal", "Sessiz ve Kararlı", "Agresif ve Hırslı", "Masum ve Şaşkın", "Lider Ruhlu", "Gizemli ve İçe Dönük", "Mükemmeliyetçi", "Umursamaz ve Rahat", "İsyankar"];
export const PHYSICAL_TRAITS = ["Keskin Yüz Hatlı", "Aura Sahibi", "Karizmatik", "Dövme Kaplı", "Soğuk Bakışlı", "Şirin Görünümlü"];
export const HEIGHTS = ["1.70", "1.75", "1.80", "1.85", "1.90", "1.95"];
export const BODY_TYPES = ["Geniş Omuzlu", "Atletik & Kaslı", "İnce & Zarif", "Zayıf & Narin"];

export const COMMENT_TEMPLATES = {
  positive: encodedData.positive.map(d),
  negative: encodedData.negative.map(d),
  lynch_scrolling: encodedData.lynch_scrolling.map(d)
};


export const MOCK_USERS = ["@idol_lover12", "@loveflower_x", "@musicgeek", "@stan_account_tr", "@pop_drama", "@dance_critic", "@just_vibes", "@realist_fan"];

export const LOCATIONS = [
  { id: 'room', name: 'Kendi Odan', bgColor: 'bg-[#2A2344]', color: 'text-purple-300', icon: 'Home' },
  { id: 'common', name: 'Ortak Alan', bgColor: 'bg-[#4A3B32]', color: 'text-orange-300', icon: 'Users' },
  { id: 'vocal', name: 'Vokal Odası', bgColor: 'bg-[#3A2A44]', color: 'text-pink-300', icon: 'Mic' },
  { id: 'dance', name: 'Dans Odası', bgColor: 'bg-[#213F3D]', color: 'text-emerald-300', icon: 'Activity' },
  { id: 'interview', name: 'Kamera Önü', bgColor: 'bg-[#233A4F]', color: 'text-sky-300', icon: 'Camera' },
  { id: 'stage', name: 'Sahne', bgColor: 'bg-[#4F232B]', color: 'text-rose-300', icon: 'Star' }
];

export const INITIAL_STATS: Stats = {
  health: 80,
  resilience: 70,
  success: 20,
  talent: 30
};
