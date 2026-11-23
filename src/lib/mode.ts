const KEY = "oasis-demo";
export const isDemo = () => typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1";
export const enterDemo = () => window.localStorage.setItem(KEY, "1");
export const exitDemo = () => window.localStorage.removeItem(KEY);
