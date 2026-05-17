export type CinematicType = 
  | "LEVEL_2"
  | "LEVEL_3"
  | "LEVEL_4"
  | "GROUP_MEMBER"
  | "SOLO_CAREER"
  | "RETIREMENT"
  | "INFLUENCER"
  | "QUIET_RETIREMENT"
  | "FAN_PHENOMENON"
  | "SCANDAL_VICTIM"
  | "CONTRACT_PRISON"
  | "INTERNATIONAL"
  | "LOSER_HEALTH"
  | "LOSER_MIND"
  | "LOSER_SUCCESS"
  | "LOSER_TALENT"
  | "LOSER_DEFAULT";

export const CINEMATIC_VIDEOS: Record<CinematicType, string> = {
  // Level Geçiş Videoları (Örnek URL'ler - Buraya kendi video linklerinizi koymalısınız)
  LEVEL_2: "https://www.youtube.com/watch?v=6jl2p796kWA",
  LEVEL_3: "https://www.youtube.com/watch?v=vSjrIAcxwFk",
  LEVEL_4: "https://www.youtube.com/watch?v=-uPcNui7bz4",

  // Başarılı Son Videoları
  GROUP_MEMBER: "https://www.youtube.com/watch?v=5OM83_QJmbA",
  SOLO_CAREER: "https://www.youtube.com/watch?v=Vut6jUZhkac",
  RETIREMENT: "https://www.youtube.com/watch?v=ykU7sEs499w",
  INFLUENCER: "https://www.youtube.com/watch?v=5pwfR2CjjvA",
  QUIET_RETIREMENT: "https://www.youtube.com/watch?v=VC1qwXVkkJg",
  FAN_PHENOMENON: "https://www.youtube.com/watch?v=wO6hzP02YQY",
  INTERNATIONAL: "https://www.youtube.com/watch?v=PKEif8bvdgk",

  // Kötü Son (Game Over) Videoları
  SCANDAL_VICTIM: "https://www.youtube.com/watch?v=vlZvWo45dWM",
  CONTRACT_PRISON: "https://www.youtube.com/watch?v=yzK2RQfauRo",
  LOSER_HEALTH: "https://www.youtube.com/watch?v=EYb_1lmF2oE",
  LOSER_MIND: "https://www.youtube.com/watch?v=VnBB-Y6vfEQ",
  LOSER_SUCCESS: "https://www.youtube.com/watch?v=yrXAibV31sI",
  LOSER_TALENT: "https://www.youtube.com/watch?v=Fr1QDH3T-O4",
  LOSER_DEFAULT: "https://www.youtube.com/watch?v=vlZvWo45dWM",
};
