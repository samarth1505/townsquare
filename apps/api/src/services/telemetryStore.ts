// In-memory "collector" for what the browser reports (a real system uses a log pipeline / vendor).
const MAX_STORED = 500;

export const telemetry = {
  events: [] as unknown[],
  errors: [] as unknown[],
};

export function store(list: unknown[], items: unknown[]) {
  list.push(...items);
  if (list.length > MAX_STORED) list.splice(0, list.length - MAX_STORED); // keep only the newest
}
