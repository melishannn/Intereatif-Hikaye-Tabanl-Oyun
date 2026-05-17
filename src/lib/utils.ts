export const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const d = (s: string) => {
  try {
    return decodeURIComponent(atob(s));
  } catch (e) {
    return s;
  }
};
