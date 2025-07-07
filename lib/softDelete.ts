export function softDeleteFilter(now: Date, extra: any = {}) {
  return {
    ...extra,
    OR: [
      { deleted_at: null },
      { deleted_at: { gt: now } },
    ],
  };
}
