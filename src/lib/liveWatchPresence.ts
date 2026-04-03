type LiveWatchEntry = {
  userId: string;
  userName: string;
  userImage?: string;
  sport: string;
  eventId: string;
  eventTitle: string;
  watchPath: string;
  updatedAt: number;
};

type PresenceStore = Map<string, LiveWatchEntry>;

const STALE_AFTER_MS = 2 * 60 * 1000;

const globalState = globalThis as unknown as {
  __liveWatchPresence?: PresenceStore;
};

const store: PresenceStore = globalState.__liveWatchPresence ?? new Map<string, LiveWatchEntry>();
globalState.__liveWatchPresence = store;

function pruneStaleEntries(now = Date.now()) {
  for (const [userId, entry] of store.entries()) {
    if (now - entry.updatedAt > STALE_AFTER_MS) {
      store.delete(userId);
    }
  }
}

export function upsertLiveWatchEntry(entry: Omit<LiveWatchEntry, "updatedAt">) {
  pruneStaleEntries();
  store.set(entry.userId, {
    ...entry,
    updatedAt: Date.now(),
  });
}

export function removeLiveWatchEntry(userId: string) {
  store.delete(userId);
}

export function getFollowingLiveWatchEntries(followingIds: string[]) {
  pruneStaleEntries();
  const idSet = new Set(followingIds);
  return Array.from(store.values())
    .filter((entry) => idSet.has(entry.userId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
