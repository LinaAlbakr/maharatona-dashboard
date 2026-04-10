/**
 * Admin PATCH toggles Client `user_status` between "active" and "inactive".
 * Legacy values "ActiveClient" / "BlockedClient" are still recognized if present.
 */
export function isClientBlocked(row: {
  user_status?: string;
  userStatus?: string;
}): boolean {
  const raw = row.user_status ?? row.userStatus;
  if (raw == null || raw === '') {
    return false;
  }
  const s = String(raw);
  const lower = s.toLowerCase();
  if (lower === 'inactive' || s === 'BlockedClient' || lower === 'blocked') {
    return true;
  }
  if (lower === 'active' || s === 'ActiveClient') {
    return false;
  }
  return false;
}
