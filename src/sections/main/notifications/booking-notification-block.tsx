'use client';

import {
  alpha,
  Avatar,
  Box,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { fetchMergedBookingExpands } from 'src/actions/notifications';
import Iconify from 'src/components/iconify';
import i18n from 'src/locales/i18n';
import { paths } from 'src/routes/paths';
import { arabicDate, englishDate, fTime } from 'src/utils/format-time';

import { isPlaceholderParentName } from './group-admin-booking-notifications';

type Props = {
  data: any;
  /** `page` = notifications screen card; `list` = home list row */
  variant?: 'page' | 'list';
};

/** Figma-aligned palette for booking notification cards */
const BN = {
  greenTitle: '#0F766E',
  tealBody: '#0B7B83',
  tealStrong: '#055f66',
  valueBlue: '#1565C0',
  valueText: '#1E293B',
  labelMuted: '#64748B',
  headerTime: '#475569',
  purpleBellBg: '#EDE9FE',
  purpleBellFg: '#7C3AED',
  flexMultiChipBg: '#EDE9FE',
  flexMultiChipFg: '#6D28D9',
  flexChildPillBg: '#EDE9FE',
  flexChildPillFg: '#5B21B6',
  sessionBoxBg: '#E8F4FC',
  sessionBoxBorder: alpha('#0288d1', 0.22),
  chevronTealBg: alpha('#0B7B83', 0.18),
  iconTileBg: '#D7EFEC',
  childCardShellBg: '#F1F5F9',
  childCardShellBorder: '#E2E8F0',
  infoGridBg: '#F6F6F6',
  gridStroke: '#E2E8F0',
  sessionDateText: '#0F2A4F',
  sessionWeekdayText: '#0B7B83',
  bookedSessionsTitle: '#0EA5B7',
};

const pickFirst = (...values: any[]) => values.find((v) => v !== undefined && v !== null && v !== '');

const readQuotedValue = (text: string) => {
  if (!text) return '';
  const quoted = text.match(/"([^"]+)"/);
  return quoted?.[1] || '';
};

const extractByPattern = (text: string, pattern: RegExp) => {
  if (!text) return '';
  const match = text.match(pattern);
  return match?.[1]?.trim() || '';
};

const readChildName = (child: any) =>
  child?.name ||
  child?.child_name ||
  child?.full_name ||
  child?.child?.name ||
  child?.name_en ||
  child?.name_ar ||
  '';

const readChildAge = (child: any) =>
  child?.age || child?.child_age || child?.years || child?.child?.age || '';

const readChildrenList = (data: any) => {
  const source = Array.isArray(data?.children)
    ? data.children
    : Array.isArray(data?.raw?.children)
      ? data.raw.children
      : Array.isArray(data?.raw?.booking?.children)
        ? data.raw.booking.children
        : [];

  return source
    .map((child: any) => {
      const name = readChildName(child);
      const age = readChildAge(child);
      if (!name) return null;
      return { name, age };
    })
    .filter(Boolean) as { name: string; age: string | number }[];
};

const MODEL_PILL: Record<string, string> = {
  minutes: 'Minutes',
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  trial: 'Trial',
};

const MODEL_PILL_AR: Record<string, string> = {
  minutes: 'دقائق',
  hourly: 'بالساعة',
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
  trial: 'تجريبي',
};

const KNOWN_BOOKING_MODELS = new Set([
  'fixed',
  'minutes',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'trial',
]);

function pickKnownBookingModel(...candidates: unknown[]): string {
  for (const c of candidates) {
    const s = String(c ?? '')
      .toLowerCase()
      .trim();
    if (KNOWN_BOOKING_MODELS.has(s)) return s;
  }
  return '';
}

function getCourseId(data: any): string {
  const raw = data?.raw ?? {};
  const id = raw.course_id?._id ?? raw.course_id;
  return id ? String(id) : '';
}

function readParentName(data: any, rawMessage: string) {
  const fromPayload = pickFirst(
    data?.parent_name,
    data?.raw?.parent_name,
    data?.raw?.parent_name_en,
    data?.raw?.parent_name_ar,
    data?.raw?.client_name,
    data?.raw?.user_name,
    data?.raw?.username,
    data?.raw?.client?.name,
    data?.raw?.client?.full_name
  );
  if (fromPayload && !isPlaceholderParentName(fromPayload)) {
    return String(fromPayload).trim();
  }
  const msg = String(rawMessage || '');
  const byClientEn = extractByPattern(msg, /by\s+the\s+client\s+(.+?)(?:\.|$)/i);
  if (byClientEn && !isPlaceholderParentName(byClientEn)) return byClientEn.trim();
  const byAr = extractByPattern(msg, /بواسطة\s+(.+?)(?:\.|$)/);
  if (byAr && !isPlaceholderParentName(byAr)) return byAr.trim();
  const byEn = extractByPattern(msg, /by\s+(.+?)(?:\.|$)/i);
  if (byEn) {
    const cleaned = byEn.replace(/^the\s+client\s+/i, '').trim();
    if (!isPlaceholderParentName(cleaned)) return cleaned;
  }
  if (fromPayload) return String(fromPayload).trim();
  return pickFirst(data?.parent_name, data?.raw?.client_name, '—');
}

function parseChildrenSegment(rawMessage: string) {
  const en = extractByPattern(rawMessage, /booked for\s+(.+?)\s+by/i);
  if (en) return en.trim();
  const reservedEn = extractByPattern(
    rawMessage,
    /(?:reserved for|been reserved for)\s+(.+?)\s+by/i
  );
  if (reservedEn) return reservedEn.trim();
  return extractByPattern(rawMessage, /لـ\s+(.+?)\s+بواسطة/i);
}

/** Strip decorative / unicode quotes from name tokens */
function cleanChildNameTokens(s: string): string {
  if (!s) return '';
  return s
    .replace(/^[\s\u200E\u200F"'«»\u201C\u201D\u2018\u2019]+/g, '')
    .replace(/[\s\u200E\u200F"'«»\u201C\u201D\u2018\u2019]+$/g, '')
    .trim();
}

function countChildrenFromSegment(segment: string) {
  if (!segment) return 0;
  return segment
    .split(/,|،/)
    .map((s) => cleanChildNameTokens(s.replace(/\s*\([^)]*\)\s*$/g, '').trim()))
    .filter(Boolean).length;
}

function formatFixedChildrenLine(
  structured: { name: string; age: string | number }[],
  segment: string,
  isAr: boolean
): string {
  if (structured.length > 0) {
    return structured
      .map((c) => (c.age === 0 || c.age ? `${c.name} (${c.age} Years)` : c.name))
      .join(isAr ? '، ' : ', ');
  }
  if (!segment) return '';
  return segment
    .split(/,|،/)
    .map((p) => cleanChildNameTokens(p.replace(/\s*\([^)]*\)\s*$/g, '').trim()))
    .filter(Boolean)
    .join(isAr ? '، ' : ', ');
}

type BookedSession = { date_en?: string; date_ar?: string; time?: string };

function parseSessionDate(s: BookedSession): Date | null {
  const en = String(s?.date_en ?? '').trim();
  const ar = String(s?.date_ar ?? '').trim();
  const fallback = en || ar;
  if (!fallback) return null;
  const normalized = fallback.includes(',') ? fallback.replace(/^[^,]+,\s*/, '') : fallback;
  const d = new Date(normalized);
  if (!Number.isNaN(d.getTime())) return d;
  const d2 = new Date(fallback);
  if (!Number.isNaN(d2.getTime())) return d2;
  return null;
}

/** Group sessions by calendar week (Sunday -> Saturday). */
function groupBookedSessionsByWeek(sessions: BookedSession[]): BookedSession[][] {
  if (!sessions.length) return [];
  const buckets = new Map<string, BookedSession[]>();
  const orderedKeys: string[] = [];

  sessions.forEach((s, idx) => {
    const d = parseSessionDate(s);
    if (!d) {
      const key = `unknown-${idx}`;
      buckets.set(key, [s]);
      orderedKeys.push(key);
      return;
    }
    const weekStart = new Date(d);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
    if (!buckets.has(key)) {
      buckets.set(key, []);
      orderedKeys.push(key);
    }
    buckets.get(key)!.push(s);
  });

  return orderedKeys.map((k) => buckets.get(k) ?? []).filter((g) => g.length > 0);
}

/** Design: split groups into two lines — weekdays / dates (without time) */
function formatBookedSessionGroup(
  group: BookedSession[],
  isAr: boolean
): { primary: string; secondary: string } {
  if (!group.length) return { primary: '', secondary: '' };
  if (isAr) {
    const parts = group.map((s) => s.date_ar).filter(Boolean) as string[];
    return {
      primary: parts.length ? parts.join('، ') : '',
      secondary: '',
    };
  }
  const parsed = group.map((s) => {
    const line = s.date_en || '';
    const weekday = line.split(',')[0]?.trim() ?? '';
    const rest = line.replace(/^[^,]+,\s*/, '').trim();
    return { weekday, rest };
  });
  const wds = parsed.map((p) => p.weekday).filter(Boolean).join(', ');
  const dayNum = parsed.map((p) => p.rest.split(/\s+/)[0]).filter(Boolean);
  const mon = parsed[0]?.rest.split(/\s+/)[1] ?? '';
  const yr = parsed[0]?.rest.split(/\s+/)[2] ?? '';
  const dateLine = dayNum.length ? `${dayNum.join(', ')} ${mon} ${yr}`.trim() : '';
  return {
    primary: wds,
    secondary: dateLine,
  };
}

function headerBookingChip(model: string, childCount: number, isAr: boolean): string {
  const bm = String(model || '').trim().toLowerCase();
  if (bm === 'fixed') return isAr ? 'ثابت' : 'Fixed';
  if (!bm || bm === 'unknown') return isAr ? 'حجز' : 'Booking';
  if (childCount > 1) return isAr ? 'مرن - متعدد' : 'Flexible - Multiple';
  const sub = isAr ? MODEL_PILL_AR[bm] ?? bm : MODEL_PILL[bm] ?? bm;
  return isAr ? `مرن - ${sub}` : `Flexible - ${sub}`;
}

function modelFromChildBookingItem(item: any): string {
  const direct = pickKnownBookingModel(
    item?.booking_model,
    item?.booking_type,
    item?.model,
    item?.type,
    item?.raw?.booking_model
  );
  if (direct) return direct;

  const fallback = String(item?.flexible_label_en ?? item?.flexible_label_ar ?? '')
    .toLowerCase()
    .trim();
  if (!fallback) return '';
  for (const key of KNOWN_BOOKING_MODELS) {
    if (fallback.includes(key)) return key;
  }
  if (fallback.includes('دقائق')) return 'minutes';
  if (fallback.includes('بالساعة')) return 'hourly';
  if (fallback.includes('يومي')) return 'daily';
  if (fallback.includes('أسبوعي')) return 'weekly';
  if (fallback.includes('شهري')) return 'monthly';
  if (fallback.includes('تجريبي')) return 'trial';
  if (fallback.includes('ثابت')) return 'fixed';
  return '';
}

function childBookingTypeChipLabel(item: any, isAr: boolean): string {
  const model = modelFromChildBookingItem(item);
  return headerBookingChip(model, 1, isAr);
}

function isFixedTypeLabel(label: string, isAr: boolean): boolean {
  if (isAr) return label === 'ثابت';
  return label === 'Fixed';
}

/** Remove decorative double quotes from API copy (display only). */
function stripQuotedPhrases(msg: string): string {
  return String(msg || '').replace(/"([^"]+)"/g, '$1');
}

function childrenCountPhrase(n: number, isAr: boolean): string {
  if (!Number.isFinite(n) || n < 1) return '—';
  if (isAr) return n === 1 ? 'طفل واحد' : `${n} أطفال`;
  return n === 1 ? '1 Child' : `${n} Children`;
}

/** True when list payload does not carry a known booking_model and we must expand to know fixed vs flexible. */
function shouldStartBookingModelBootstrap(d: any): boolean {
  if (d?.notification_type !== 'ADMIN_NEW_BOOKING' || !d?.id) return false;
  return !pickKnownBookingModel(
    d?.raw?.booking_model,
    d?.booking_model,
    d?.booking_type,
    d?.actual_type
  );
}

function MetricCell({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: BN.iconTileBg,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={20} style={{ color: BN.tealBody }} />
      </Box>
      <Stack spacing={0.35} sx={{ minWidth: 0, pt: 0.125 }}>
        <Typography
          variant="caption"
          sx={{ color: BN.labelMuted, fontWeight: 500, fontSize: '0.8125rem' }}
        >
          {label}
        </Typography>
        {children}
      </Stack>
    </Stack>
  );
}

function InfoGridIconTile({ children, size = 36 }: { children: ReactNode; size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: BN.iconTileBg,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

function BellBadge({ size }: { size: number }) {
  const iconPx = 40;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        bgcolor: BN.purpleBellBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src="/assets/icons/notification/notificationIcon.png"
        alt="notification"
        sx={{
          width: iconPx,
          height: iconPx,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
}

export default function BookingNotificationBlock({ data, variant = 'page' }: Readonly<Props>) {
  const formattedDate =
    i18n.language === 'ar' ? arabicDate(data?.created_at) : englishDate(data?.created_at);
  const isAr = i18n.language === 'ar';
  const groupedBookingCount =
    typeof data?._groupedBookingCount === 'number' && data._groupedBookingCount > 1
      ? data._groupedBookingCount
      : 0;
  const rawBookingModel = pickKnownBookingModel(
    data?.raw?.booking_model,
    data?.booking_model,
    data?.booking_type,
    data?.actual_type
  );

  const notificationId = data?.id != null ? String(data.id) : '';

  const expandIds = useMemo<string[]>(() => {
    const grouped = Array.isArray(data?._groupedBookingIds) ? data._groupedBookingIds : [];
    const ids: string[] =
      grouped.length > 0
        ? grouped.map((id: unknown) => String(id))
        : notificationId
          ? [notificationId]
          : [];
    return [...new Set(ids.filter(Boolean))];
  }, [data?._groupedBookingIds, notificationId]);

  const expandCacheKey = expandIds.length ? expandIds.slice().sort().join('|') : '';

  const courseId = getCourseId(data);
  const courseHref = courseId ? `${paths.dashboard.courses}/${courseId}` : '';
  const fallbackMsg = String(data?.message || '').trim();
  const messageForLang = isAr
    ? String(data?.raw?.message_ar || '').trim() || fallbackMsg
    : String(data?.raw?.message_en || '').trim() || fallbackMsg;
  const titleForLang =
    (isAr ? String(data?.raw?.title_ar || '').trim() : String(data?.raw?.title_en || '').trim()) ||
    String(data?.title || '').trim() ||
    (isAr ? 'تأكيد الحجز' : 'Booking Confirmed');

  const courseName =
    pickFirst(
      data?.course_name,
      isAr ? data?.raw?.course?.name_ar : data?.raw?.course?.name_en,
      isAr ? data?.raw?.course?.name_en : data?.raw?.course?.name_ar,
      readQuotedValue(String(data?.title || '')),
      readQuotedValue(messageForLang)
    ) || '—';
  const parentName = readParentName(data, messageForLang);
  const structuredChildren = readChildrenList(data);
  const childrenSegment = parseChildrenSegment(messageForLang);
  const fixedChildrenDisplay = formatFixedChildrenLine(structuredChildren, childrenSegment, isAr);

  const childCountFromMessage = structuredChildren.length || countChildrenFromSegment(childrenSegment);

  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<any | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(() => shouldStartBookingModelBootstrap(data));
  const detailRef = useRef(detail);
  const prefetchedExpandKeyRef = useRef<string | null>(null);
  const lastLoadedExpandKeyRef = useRef<string | null>(null);
  const expandIdsRef = useRef(expandIds);
  detailRef.current = detail;
  expandIdsRef.current = expandIds;

  // List payload often omits booking_model; prefetch expand so Fixed vs Flexible is correct before first interaction.
  useEffect(() => {
    if (data?.notification_type !== 'ADMIN_NEW_BOOKING' || !expandCacheKey) {
      prefetchedExpandKeyRef.current = null;
      setBootstrapping(false);
      return;
    }

    const listKnowsModel = Boolean(
      pickKnownBookingModel(
        data?.raw?.booking_model,
        data?.booking_model,
        data?.booking_type,
        data?.actual_type
      )
    );

    if (prefetchedExpandKeyRef.current !== expandCacheKey) {
      prefetchedExpandKeyRef.current = expandCacheKey;
      lastLoadedExpandKeyRef.current = null;
      setExpanded(false);
      setDetail(undefined);
      setLoading(false);
    }

    if (listKnowsModel) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    setBootstrapping(true);
    (async () => {
      try {
        const res = await fetchMergedBookingExpands(expandIds);
        if (!cancelled) setDetail(res ?? null);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expandCacheKey, expandIds, data?.notification_type, data?.raw?.booking_model, data?.booking_model, data?.booking_type, data?.actual_type]);

  const loadDetail = useCallback(async () => {
    if (!expandCacheKey) return;
    if (
      detailRef.current != null &&
      typeof detailRef.current === 'object' &&
      lastLoadedExpandKeyRef.current === expandCacheKey
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetchMergedBookingExpands(expandIdsRef.current);
      lastLoadedExpandKeyRef.current = expandCacheKey;
      setDetail(res ?? null);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [expandCacheKey]);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      void loadDetail();
    }
  };

  const effectiveBookingModel = pickKnownBookingModel(detail?.booking_model, rawBookingModel);
  const childCountForChip =
    detail?.booking_items?.length > 0 ? detail.booking_items.length : childCountFromMessage;

  const headerChipText = useMemo(
    () => headerBookingChip(effectiveBookingModel, childCountForChip, isAr),
    [effectiveBookingModel, childCountForChip, isAr]
  );

  const isFixed = effectiveBookingModel === 'fixed';

  const parentNameLine = (() => {
    const fromDetail = detail?.parent?.name;
    if (fromDetail && !isPlaceholderParentName(fromDetail)) return String(fromDetail).trim();
    if (parentName && !isPlaceholderParentName(parentName)) return parentName;
    return pickFirst(fromDetail, parentName, '—');
  })();
  const fixedChildrenFromDetail =
    Array.isArray(detail?.booking_items) && detail.booking_items.length > 0
      ? (detail.booking_items as { child_name?: string }[])
          .map((i) => i.child_name)
          .filter(Boolean)
          .join(isAr ? '، ' : ', ')
      : '';
  const fixedChildrenLine = fixedChildrenDisplay || fixedChildrenFromDetail;

  const programLabel = isAr ? 'البرنامج' : 'Program';
  const centerLabel = isAr ? 'المركز' : 'Center';
  const parentLabel = isAr ? 'حجز بواسطة' : 'Booked by';
  const connectLabel = isAr ? 'التواصل' : 'Contact';
  const perChildTitle = isAr ? 'حجوزات لكل طفل' : 'Bookings Per Child';
  const bookedSessionsLabel = isAr ? 'الجلسات المحجوزة' : 'Booked sessions';
  const durationLabel = isAr ? 'المدة' : 'Duration';
  const timeLabel = isAr ? 'الوقت' : 'Time';
  const sessionsLabel = isAr ? 'الجلسات' : 'Sessions';
  const packageLabel = isAr ? 'الباقة' : 'Package';
  const bookingTypeLabel = isAr ? 'نوع الحجز' : 'Booking Type';

  const paperSx =
    variant === 'page'
      ? {
          p: { xs: 1.5, md: 2.25 },
          borderRadius: 2.5,
          backgroundColor: (theme: any) => alpha(theme.palette.background.paper, 0.95),
          border: (theme: any) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }
      : {
          p: 2,
          borderRadius: 2,
          bgcolor: 'transparent',
          boxShadow: 'none',
          border: (theme: any) => `1px solid ${theme.palette.divider}`,
        };

  if (isFixed) {
    return (
      <Paper sx={paperSx}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
            <BellBadge size={40} />
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography sx={{ color: '#3CB8BB', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>
                  {titleForLang}
                </Typography>
                <Chip
                  size="small"
                  label={isAr ? 'ثابت' : 'Fixed'}
                  sx={{
                    height: 26,
                    borderRadius: '999px',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1.25 },
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
                    color: 'info.main',
                  }}
                />
              </Stack>
              <Typography sx={{ color: '#006C9C', lineHeight: 1.6, fontSize: '14px' }}>
                {courseHref ? (
                  <Link href={courseHref} style={{ fontWeight: 700, color: '#1976d2', textDecoration: 'none' }}>
                    {courseName}
                  </Link>
                ) : (
                  <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {courseName}
                  </Box>
                )}
                {fixedChildrenLine ? (
                  <>
                    <Box component="span"> {isAr ? 'تم حجزها لـ' : 'has been booked for'} </Box>
                    <Box component="span" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                      {fixedChildrenLine}
                    </Box>
                  </>
                ) : (
                  <Box component="span"> {isAr ? 'تم حجزها' : 'has been booked'} </Box>
                )}
                <Box component="span"> {isAr ? 'بواسطة' : 'by'} </Box>
                <Box component="span" sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                  {parentNameLine}
                </Box>
                .
              </Typography>
            </Stack>
          </Stack>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '14px',
              color: '#006C9C',
              whiteSpace: 'nowrap',
              pl: 1,
            }}
          >
            {fTime(data?.created_at) || formattedDate}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const flexibleDescription = stripQuotedPhrases(messageForLang);

  const awaitingModelBootstrap =
    data?.notification_type === 'ADMIN_NEW_BOOKING' &&
    !rawBookingModel &&
    detail === undefined &&
    bootstrapping;

  const mergedListCount =
    typeof data?._groupedBookingCount === 'number' && data._groupedBookingCount > 0
      ? data._groupedBookingCount
      : Array.isArray(data?._groupedBookingIds)
        ? data._groupedBookingIds.length
        : 0;

  const nChildrenForSummary = Math.max(childCountForChip, childCountFromMessage, mergedListCount);

  const parentForSummary = parentNameLine;
  const showDesignedSummary =
    Boolean(courseName) &&
    Boolean(parentForSummary) &&
    parentForSummary !== '—' &&
    !isPlaceholderParentName(parentForSummary) &&
    nChildrenForSummary > 0;

  const isFlexMultiVisual =
    childCountForChip > 1 ||
    mergedListCount > 1 ||
    /multiple|متعدد/i.test(headerChipText);

  const createdTime = fTime(data?.created_at);

  return (
    <Paper sx={paperSx}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
        <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
          <BellBadge size={40} />
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ minWidth: 0 }}>
                <Typography sx={{ color: '#3CB8BB', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>
                {titleForLang}
              </Typography>
              <Chip
                size="small"
                label={headerChipText}
                sx={{
                  height: 26,
                  borderRadius: '999px',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1.25 },
                  visibility: awaitingModelBootstrap ? 'hidden' : 'visible',
                  ...(isFixedTypeLabel(headerChipText, isAr)
                    ? {
                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.16),
                        color: 'info.main',
                      }
                    : isFlexMultiVisual
                      ? { bgcolor: BN.flexMultiChipBg, color: BN.flexMultiChipFg }
                      : { bgcolor: alpha(BN.tealBody, 0.12), color: BN.tealStrong }),
                }}
              />
            </Stack>

            {showDesignedSummary ? (
              <Typography
                sx={{ color: '#006C9C', fontWeight: 600, lineHeight: 1.65, pr: { xs: 0, sm: 0.5 }, fontSize: '14px' }}
              >
                {isAr ? (
                  <>
                    تم حجز{' '}
                    <Box component="span" sx={{ color: BN.valueBlue, fontWeight: 700 }}>
                      {'\u201C'}
                      {courseName}
                      {'\u201D'}
                    </Box>{' '}
                    لـ{' '}
                    <Box component="span" sx={{ color: BN.valueBlue, fontWeight: 700 }}>
                      {'\u201C'}
                      {childrenCountPhrase(nChildrenForSummary, isAr)}
                      {'\u201D'}
                    </Box>{' '}
                    بواسطة{' '}
                    <Box component="span" sx={{ color: BN.valueBlue, fontWeight: 700 }}>
                      {'\u201C'}
                      {parentForSummary}
                      {'\u201D'}
                    </Box>
                    .
                  </>
                ) : (
                  <>
                    <Box component="span" sx={{ color: BN.valueBlue, fontWeight: 700 }}>
                      {'\u201C'}
                      {courseName}
                      {'\u201D'}
                    </Box>{' '}
                    has been booked for{' '}
                    <Box component="span" sx={{ color: BN.valueBlue, fontWeight: 700 }}>
                      {'\u201C'}
                      {childrenCountPhrase(nChildrenForSummary, isAr)}
                      {'\u201D'}
                    </Box>{' '}
                    by{' '}
                    <Box component="span" sx={{ color: BN.valueBlue, fontWeight: 700 }}>
                      {'\u201C'}
                      {parentForSummary}
                      {'\u201D'}
                    </Box>
                    .
                  </>
                )}
              </Typography>
            ) : (
              <Typography sx={{ color: '#006C9C', fontWeight: 600, lineHeight: 1.65, pr: 1, fontSize: '14px' }}>
                {flexibleDescription}
              </Typography>
            )}

            {!awaitingModelBootstrap ? (
              <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
                {loading ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {isAr ? 'جاري التحميل…' : 'Loading…'}
                  </Typography>
                ) : detail != null && typeof detail === 'object' ? (
                  <Stack spacing={2.25} sx={{ pt: 0.5 }}>
                    <Box
                      sx={{
                        border: `1px solid ${BN.gridStroke}`,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: BN.infoGridBg,
                      }}
                    >
                      <Grid container>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          sx={{
                            px: 2.25,
                            py: 1.75,
                            borderBottom: `1px solid ${BN.gridStroke}`,
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <InfoGridIconTile>
                              <Box
                                component="img"
                                src="/assets/icons/notification/Booked%20by.png"
                                alt="booked by"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {parentLabel}
                              </Typography>
                              <Typography sx={{ color: '#2B509C', fontWeight: 600, fontSize: '14px' }}>
                                {detail.parent?.name ?? '—'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          sx={{
                            px: 2.25,
                            py: 1.75,
                            borderBottom: `1px solid ${BN.gridStroke}`,
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <InfoGridIconTile>
                              <Box
                                component="img"
                                src="/assets/icons/notification/Contact.png"
                                alt="contact"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {connectLabel}
                              </Typography>
                              <Typography sx={{ color: '#2B509C', fontWeight: 600, fontSize: '14px' }}>
                                {detail.parent?.phone ?? '—'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ px: 2.25, py: 1.75 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <InfoGridIconTile>
                              <Box
                                component="img"
                                src="/assets/icons/notification/Programs.png"
                                alt="program"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {programLabel}
                              </Typography>
                              <Typography sx={{ color: '#2B509C', fontWeight: 600, fontSize: '14px' }}>
                                {isAr ? detail.program?.ar ?? detail.program?.en : detail.program?.en ?? detail.program?.ar}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ px: 2.25, py: 1.75 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <InfoGridIconTile>
                              <Box
                                component="img"
                                src="/assets/icons/notification/Center.png"
                                alt="center"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {centerLabel}
                              </Typography>
                              <Typography sx={{ color: '#2B509C', fontWeight: 600, fontSize: '14px' }}>
                                {detail.center?.name ?? '—'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>

                    {detail.package ? (
                      <Chip
                        size="small"
                        label={`${packageLabel}: ${isAr ? detail.package.name_ar ?? detail.package.name_en : detail.package.name_en ?? detail.package.name_ar}`}
                        sx={{
                          alignSelf: 'flex-start',
                          fontWeight: 600,
                          height: 26,
                          borderRadius: '999px',
                          '& .MuiChip-label': { px: 1.25 },
                        }}
                      />
                    ) : null}

                    <Typography
                      sx={{
                        color: BN.bookedSessionsTitle,
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        mt: 0.5,
                      }}
                    >
                      {perChildTitle}
                    </Typography>

                    <Stack spacing={2}>
                      {(detail.booking_items ?? []).map((item: any, idx: number) => {
                        const typeLabel = childBookingTypeChipLabel(item, isAr);
                        const childModel = modelFromChildBookingItem(item);
                        const fixedType = childModel === 'fixed';
                        const hideDuration = childModel === 'daily' || childModel === 'weekly' || childModel === 'monthly';
                        const metricMd = hideDuration ? 4 : 3;
                        const groups = groupBookedSessionsByWeek(
                          Array.isArray(item.booked_sessions) ? item.booked_sessions : []
                        );
                        return (
                          <Box
                            key={idx}
                            sx={{
                              p: 2.25,
                              borderRadius: 3,
                              bgcolor: BN.childCardShellBg,
                              border: `1px solid ${BN.childCardShellBorder}`,
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: BN.tealBody,
                                  color: '#fff',
                                  width: 40,
                                  height: 40,
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                }}
                              >
                                {item.child_initial}
                              </Avatar>
                              <Typography
                                sx={{
                                  color: BN.bookedSessionsTitle,
                                  fontWeight: 600,
                                  fontSize: '0.9375rem',
                                }}
                              >
                                {item.child_name}
                              </Typography>
                            </Stack>

                            <Paper
                              elevation={0}
                              sx={{
                                borderRadius: 2,
                                p: 2,
                                bgcolor: 'background.paper',
                                border: `1px solid ${BN.gridStroke}`,
                                boxShadow: (theme) => `0 1px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                              }}
                            >
                              <Grid container>
                                <Grid
                                  item
                                  xs={12}
                                  md={metricMd}
                                  sx={{
                                    px: 1.75,
                                    py: 1.25,
                                    borderRight: { md: `1px solid ${BN.gridStroke}` },
                                    borderBottom: { xs: `1px solid ${BN.gridStroke}`, md: 'none' },
                                  }}
                                >
                                  <MetricCell icon="solar:tag-bold" label={bookingTypeLabel}>
                                    <Chip
                                      size="small"
                                      label={typeLabel}
                                      sx={{
                                        height: 24,
                                        borderRadius: '999px',
                                        fontWeight: 600,
                                        alignSelf: 'flex-start',
                                        '& .MuiChip-label': { px: 1.25 },
                                        bgcolor: fixedType ? (theme) => alpha(theme.palette.info.main, 0.14) : BN.flexMultiChipBg,
                                        color: fixedType ? 'info.dark' : BN.flexMultiChipFg,
                                      }}
                                    />
                                  </MetricCell>
                                </Grid>
                                {!hideDuration ? (
                                  <Grid
                                    item
                                    xs={12}
                                    md={metricMd}
                                    sx={{
                                      px: 1.75,
                                      py: 1.25,
                                      borderRight: { md: `1px solid ${BN.gridStroke}` },
                                      borderBottom: { xs: `1px solid ${BN.gridStroke}`, md: 'none' },
                                    }}
                                  >
                                    <MetricCell icon="solar:clock-circle-bold" label={durationLabel}>
                                      <Typography sx={{ color: BN.valueText, fontWeight: 600, fontSize: '0.9375rem' }}>
                                        {item.duration ?? '—'}
                                      </Typography>
                                    </MetricCell>
                                  </Grid>
                                ) : null}
                                <Grid
                                  item
                                  xs={12}
                                  md={metricMd}
                                  sx={{
                                    px: 1.75,
                                    py: 1.25,
                                    borderRight: { md: `1px solid ${BN.gridStroke}` },
                                    borderBottom: { xs: `1px solid ${BN.gridStroke}`, md: 'none' },
                                  }}
                                >
                                  <MetricCell icon="solar:clock-circle-bold" label={timeLabel}>
                                    <Typography sx={{ color: BN.valueText, fontWeight: 600, fontSize: '0.9375rem' }}>
                                      {item.time ?? '—'}
                                    </Typography>
                                  </MetricCell>
                                </Grid>
                                <Grid item xs={12} md={metricMd} sx={{ px: 1.75, py: 1.25 }}>
                                  <MetricCell icon="solar:calendar-bold" label={sessionsLabel}>
                                    <Typography sx={{ color: BN.valueText, fontWeight: 600, fontSize: '0.9375rem' }}>
                                      {item.sessions_count != null ? item.sessions_count : '—'}
                                    </Typography>
                                  </MetricCell>
                                </Grid>
                              </Grid>

                              {Array.isArray(item.booked_sessions) && item.booked_sessions.length > 0 ? (
                                <>
                                  <Divider sx={{ borderColor: BN.gridStroke, mt: 1.75, mb: 1.5 }} />
                                  <Typography
                                    sx={{
                                      color: BN.bookedSessionsTitle,
                                      fontWeight: 600,
                                      fontSize: '0.9375rem',
                                      mb: 1.25,
                                    }}
                                  >
                                    {bookedSessionsLabel}
                                  </Typography>
                                  <Grid container spacing={1.5}>
                                    {groups.map((g, gi) => {
                                      const parts = formatBookedSessionGroup(g, isAr);
                                      return (
                                        <Grid item xs={12} sm={6} key={gi}>
                                          <Box
                                            sx={{
                                              p: 1.5,
                                              borderRadius: 2,
                                              bgcolor: BN.sessionBoxBg,
                                              border: '1px solid',
                                              borderColor: BN.sessionBoxBorder,
                                              height: '100%',
                                            }}
                                          >
                                            <Stack direction="row" spacing={1.25} alignItems="flex-start">
                                              <Iconify
                                                icon="solar:calendar-bold"
                                                width={20}
                                                style={{ color: BN.tealBody, flexShrink: 0, marginTop: 2 }}
                                              />
                                              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                                {parts.primary ? (
                                                  <Typography
                                                    sx={{
                                                      color: BN.sessionWeekdayText,
                                                      fontWeight: 600,
                                                      fontSize: '0.875rem',
                                                      lineHeight: 1.4,
                                                    }}
                                                  >
                                                    {parts.primary}
                                                  </Typography>
                                                ) : null}
                                                {parts.secondary ? (
                                                  <Typography
                                                    sx={{
                                                      color: BN.sessionDateText,
                                                      fontWeight: 600,
                                                      fontSize: '0.875rem',
                                                      lineHeight: 1.4,
                                                    }}
                                                  >
                                                    {parts.secondary}
                                                  </Typography>
                                                ) : null}
                                              </Stack>
                                            </Stack>
                                          </Box>
                                        </Grid>
                                      );
                                    })}
                                  </Grid>
                                </>
                              ) : null}
                            </Paper>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {isAr ? 'لا تتوفر تفاصيل إضافية.' : 'No additional details available.'}
                  </Typography>
                )}
              </Collapse>
            ) : null}
          </Stack>
        </Stack>

        {awaitingModelBootstrap ? (
          <Typography sx={{ whiteSpace: 'nowrap', pl: 1, lineHeight: 1.6, fontSize: '14px', color: '#006C9C' }}>
            {formattedDate}
          </Typography>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, alignSelf: 'flex-start' }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#006C9C',
                whiteSpace: 'nowrap',
                pl: 0.5,
              }}
            >
              {createdTime || formattedDate}
            </Typography>
            <IconButton
              onClick={toggleExpand}
              aria-expanded={expanded}
              sx={{
                borderRadius: '50%',
                width: 40,
                height: 40,
                bgcolor: '#3CB8BB',
                color: '#FFFFFF',
                flexShrink: 0,
                '&:hover': { bgcolor: '#33A8AB' },
              }}
            >
              <Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={22.72} />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
