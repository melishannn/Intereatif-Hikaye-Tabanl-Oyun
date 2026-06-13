export type CinematicType =
  | "LEVEL_2"
  | "LEVEL_3"
  | "LEVEL_4"
  | "LEVEL_2_F"
  | "LEVEL_3_F"
  | "LEVEL_4_F"
  | "GROUP_MEMBER"
  | "GROUP_MEMBER_F"
  | "SOLO_CAREER"
  | "SOLO_CAREER_F"
  | "RETIREMENT"
  | "RETIREMENT_F"
  | "INFLUENCER"
  | "INFLUENCER_F"
  | "QUIET_RETIREMENT"
  | "QUIET_RETIREMENT_F"
  | "FAN_PHENOMENON"
  | "FAN_PHENOMENON_F"
  | "SCANDAL_VICTIM"
  | "SCANDAL_VICTIM_F"
  | "CONTRACT_PRISON"
  | "CONTRACT_PRISON_F"
  | "INTERNATIONAL"
  | "INTERNATIONAL_F"
  | "LOSER_HEALTH"
  | "LOSER_HEALTH_F"
  | "LOSER_MIND"
  | "LOSER_MIND_F"
  | "LOSER_SUCCESS"
  | "LOSER_SUCCESS_F"
  | "LOSER_TALENT"
  | "LOSER_TALENT_F"
  | "LOSER_DEFAULT"
  | "LOSER_DEFAULT_F";

export const CINEMATIC_VIDEOS: Record<CinematicType, string> = {
  // Level Geçiş Videoları (Örnek URL'ler - Buraya kendi video linklerinizi koymalısınız)
  LEVEL_2: "https://www.youtube.com/watch?v=6jl2p796kWA",
  LEVEL_3: "https://www.youtube.com/watch?v=vSjrIAcxwFk",
  LEVEL_4: "https://www.youtube.com/watch?v=-uPcNui7bz4",

  LEVEL_2_F: "https://www.youtube.com/watch?v=i90PeFygmgU",
  LEVEL_3_F: "https://www.youtube.com/watch?v=ZJv_ljliaGY",
  LEVEL_4_F: "https://www.youtube.com/watch?v=Havssc9neKc",

  // Başarılı Son Videoları
  GROUP_MEMBER: "https://www.youtube.com/watch?v=5OM83_QJmbA",
  GROUP_MEMBER_F: "https://www.youtube.com/watch?v=UElpdtegYxc",
  SOLO_CAREER: "https://www.youtube.com/watch?v=Vut6jUZhkac",
  SOLO_CAREER_F: "https://www.youtube.com/watch?v=5fVjBamylok",
  RETIREMENT: "https://www.youtube.com/watch?v=ykU7sEs499w",
  RETIREMENT_F: "https://www.youtube.com/watch?v=ykU7sEs499w",
  INFLUENCER: "https://www.youtube.com/watch?v=5pwfR2CjjvA",
  INFLUENCER_F: "https://www.youtube.com/watch?v=5pwfR2CjjvA",
  QUIET_RETIREMENT: "https://www.youtube.com/watch?v=VC1qwXVkkJg",
  QUIET_RETIREMENT_F: "https://www.youtube.com/watch?v=VC1qwXVkkJg",
  FAN_PHENOMENON: "https://www.youtube.com/watch?v=wO6hzP02YQY",
  FAN_PHENOMENON_F: "https://www.youtube.com/watch?v=wO6hzP02YQY",
  INTERNATIONAL: "https://www.youtube.com/watch?v=PKEif8bvdgk",
  INTERNATIONAL_F: "https://www.youtube.com/watch?v=PKEif8bvdgk",

  // Kötü Son (Game Over) Videoları
  SCANDAL_VICTIM: "https://www.youtube.com/watch?v=vlZvWo45dWM",
  SCANDAL_VICTIM_F: "https://www.youtube.com/watch?v=vlZvWo45dWM",
  CONTRACT_PRISON: "https://www.youtube.com/watch?v=yzK2RQfauRo",
  CONTRACT_PRISON_F: "https://www.youtube.com/watch?v=yzK2RQfauRo",
  LOSER_HEALTH: "https://www.youtube.com/watch?v=EYb_1lmF2oE",
  LOSER_HEALTH_F: "https://www.youtube.com/watch?v=EYb_1lmF2oE",
  LOSER_MIND: "https://www.youtube.com/watch?v=VnBB-Y6vfEQ",
  LOSER_MIND_F: "https://www.youtube.com/watch?v=VnBB-Y6vfEQ",
  LOSER_SUCCESS: "https://www.youtube.com/watch?v=yrXAibV31sI",
  LOSER_SUCCESS_F: "https://www.youtube.com/watch?v=yrXAibV31sI",
  LOSER_TALENT: "https://www.youtube.com/watch?v=Fr1QDH3T-O4",
  LOSER_TALENT_F: "https://www.youtube.com/watch?v=Fr1QDH3T-O4",
  LOSER_DEFAULT: "https://www.youtube.com/watch?v=vlZvWo45dWM",
  LOSER_DEFAULT_F: "https://www.youtube.com/watch?v=vlZvWo45dWM",
};
