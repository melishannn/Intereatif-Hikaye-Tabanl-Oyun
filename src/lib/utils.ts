export const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const d = (s: string) => {
  try {
    return decodeURIComponent(atob(s));
  } catch (e) {
    return s;
  }
};

export const filterProfanity = (text: string | null | undefined): string => {
  if (!text) return "";
  const badWords = [
    "amk",
    "sik",
    "yarak",
    "oç",
    "piç",
    "siktir",
    "orospu",
    "pic",
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "yarrak",
    "göt",
    "amq",
    "aq",
    "amına",
  ];
  let filtered = text;
  badWords.forEach((word) => {
    // using word boundaries requires a bit more regex complexity, but a simple replace is fine for this context
    const regex = new RegExp(`(${word})`, "gi");
    filtered = filtered.replace(regex, "***");
  });
  return filtered;
};
