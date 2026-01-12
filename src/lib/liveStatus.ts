export type StatusLike =
  | string
  | { short?: string | null; long?: string | null; elapsed?: number | null }
  | null
  | undefined;

const compact = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
};

export function isLiveStatus(status: StatusLike): boolean {
  if (!status) return false;

  const elapsed =
    typeof status === "object" && "elapsed" in status && status?.elapsed != null
      ? Number(status.elapsed)
      : undefined;
  if (typeof elapsed === "number" && !Number.isNaN(elapsed) && elapsed > 0) {
    return true;
  }

  let baseText = "";
  if (typeof status === "string") {
    baseText = status;
  } else {
    const short = status.short;
    const long = status.long;
    baseText = (typeof short === "string" ? short : "") || (typeof long === "string" ? long : "");
  }

  const normalized = compact(baseText);
  if (!normalized) return false;

  const liveTokens = [
    "live",
    "inprogress",
    "inplay",
    "playing",
    "ongoing",
    "running",
    "half",
    "halftime",
    "quarter",
    "q1",
    "q2",
    "q3",
    "q4",
    "period",
    "p1",
    "p2",
    "p3",
    "h1",
    "h2",
    "et",
    "ot",
    "ht",
    "1h",
    "2h",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "stumps",
    "inning",
    "innings",
    "break",
    "session",
    "lap",
    "race",
  ];

  return liveTokens.some((token) => normalized.includes(token));
}

export function sortByLiveStatus<T>(
  items: readonly T[],
  getStatus: (item: T) => StatusLike
): T[] {
  const withPriority = items.map((item, index) => ({
    item,
    priority: isLiveStatus(getStatus(item)) ? 0 : 1,
    index,
  }));

  return withPriority
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .map((entry) => entry.item);
}
