export const DISCOVER_SESSION_KEY = "tutu-kuda-session-v1";

type StoredSession = {
  phase?: unknown;
  prompt?: unknown;
};

export function hasActiveDiscoverSession(storage?: Pick<Storage, "getItem">): boolean {
  const store = storage ?? getBrowserStorage();
  if (!store) return false;
  try {
    const raw = store.getItem(DISCOVER_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as StoredSession;
    const prompt = typeof parsed.prompt === "string" && parsed.prompt.trim().length > 0;
    const phase = typeof parsed.phase === "string" && parsed.phase !== "intent";
    return prompt || phase;
  } catch {
    return false;
  }
}

function getBrowserStorage(): Pick<Storage, "getItem"> | undefined {
  try {
    if (typeof localStorage === "undefined") return undefined;
    return localStorage;
  } catch {
    return undefined;
  }
}
