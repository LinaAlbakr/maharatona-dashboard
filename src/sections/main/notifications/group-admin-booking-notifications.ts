function courseIdOf(n: any): string {
  const r = n?.raw ?? {};
  const c = r.course_id ?? n.course_id;
  if (c == null || c === '') return '';
  if (typeof c === 'object' && '_id' in c) return String((c as { _id?: unknown })._id ?? '');
  return String(c);
}

function bookingModelOf(n: any): string {
  return String(
    n?.raw?.booking_model ?? n?.booking_model ?? n?.booking_type ?? ''
  )
    .toLowerCase()
    .trim();
}

function dayBucket(created: string | Date | undefined): string {
  const d = created ? new Date(created) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function paymentIdOf(n: any): string {
  const r = n?.raw ?? {};
  const p = r.payment_id ?? r.paymentId;
  if (p == null || p === '') return '';
  if (typeof p === 'object' && p !== null && '_id' in p) return String((p as { _id?: unknown })._id ?? '');
  return String(p);
}

function messageFingerprint(n: any): string {
  const msg =
    String(n?.message ?? '').trim() ||
    String(n?.raw?.message_en ?? n?.raw?.message_ar ?? '').trim();
  return msg;
}

/** Same checkout can produce near-identical copy with different child names — normalize for grouping. */
function normalizedMessageFingerprint(n: any): string {
  let msg = messageFingerprint(n).replace(/\s+/g, ' ').trim();
  msg = msg.replace(
    /(?:has been booked for|been reserved for|reserved for|booked for)\s+.+?\s+(?:by|بواسطة)\s+/i,
    '__FOR_CHILDREN_BY__ '
  );
  msg = msg.replace(/لـ\s+.+?\s+بواسطة\s+/i, '__FOR_CHILDREN_BY__ ');
  return msg;
}

export function isPlaceholderParentName(name: unknown): boolean {
  const t = String(name ?? '')
    .trim()
    .replace(/^the\s+client\s+/i, '');
  if (!t) return true;
  return /^parent$/i.test(t) || /^client$/i.test(t) || t === 'الوالد' || /^عميل$/i.test(t);
}

/** Key for rows that should represent the same booking burst (multi-line client payload). */
export function adminNewBookingGroupKey(n: any): string | null {
  if (n?.notification_type !== 'ADMIN_NEW_BOOKING') return null;
  const pay = paymentIdOf(n);
  if (pay) {
    return ['pay', courseIdOf(n), bookingModelOf(n), pay].join('\u0001');
  }
  return [
    courseIdOf(n),
    bookingModelOf(n),
    normalizedMessageFingerprint(n),
    dayBucket(n?.created_at),
  ].join('\u0001');
}

export type GroupedNotification = any & {
  _groupedBookingCount?: number;
  _groupedBookingIds?: string[];
};

/**
 * Collapse duplicate ADMIN_NEW_BOOKING rows (same course, model, copy, minute) into one
 * display item. Preserves global list order (first row of each cluster is the representative).
 */
export function groupAdminNewBookingNotifications(items: any[]): GroupedNotification[] {
  if (!Array.isArray(items) || items.length === 0) return items;

  const clusters = new Map<string, any[]>();
  const slotOrder: ({ kind: 'cluster'; key: string } | { kind: 'single'; item: any })[] = [];

  for (const item of items) {
    const key = adminNewBookingGroupKey(item);
    if (key == null) {
      slotOrder.push({ kind: 'single', item });
      continue;
    }
    if (!clusters.has(key)) {
      clusters.set(key, []);
      slotOrder.push({ kind: 'cluster', key });
    }
    clusters.get(key)!.push(item);
  }

  const out: GroupedNotification[] = [];
  for (const slot of slotOrder) {
    if (slot.kind === 'single') {
      out.push(slot.item);
      continue;
    }
    const cluster = clusters.get(slot.key)!;
    if (cluster.length === 1) {
      out.push(cluster[0]);
    } else {
      const primary = cluster[0];
      const parentGuess = cluster
        .map((c) => c?.parent_name)
        .find((n) => n && !isPlaceholderParentName(n));
      out.push({
        ...primary,
        _groupedBookingCount: cluster.length,
        _groupedBookingIds: cluster.map((c) => c?.id).filter(Boolean),
        ...(parentGuess ? { parent_name: parentGuess } : {}),
      });
    }
  }
  return out;
}
