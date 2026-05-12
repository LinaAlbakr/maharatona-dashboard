'use client';

import {
  alpha,
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
import Image from 'next/image';
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
  sessionBoxBg: '#F5FBFC',
  sessionBoxBorder: alpha('#0288d1', 0.22),
  chevronTealBg: alpha('#0B7B83', 0.18),
  iconTileBg: '#D7EFEC',
  childCardShellBg: '#F6F6F6',
  childCardShellBorder: '#E9ECEE',
  infoGridBg: '#F6F6F6',
  gridStroke: '#E9ECEE',
  sessionDateText: '#2B509C',
  sessionWeekdayText: '#2B509C',
  bookedSessionsTitle: '#006C9C',
};

const pickFirst = (...values: any[]) => values.find((v) => v !== undefined && v !== null && v !== '');

const formatEnglishTimeLtr = (value: any) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  const h24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  return `\u200E${h12}:${minutes} ${ampm}\u200E`;
};

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
  child?.child_id?.name ||
  child?.child_id?.full_name ||
  child?.child?.name ||
  child?.name_en ||
  child?.name_ar ||
  '';

const readChildAge = (child: any) =>
  child?.age ||
  child?.child_age ||
  child?.years ||
  child?.child?.age ||
  child?.child_id?.age ||
  '';

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

function parseCourseNameFromMessage(rawMessage: string): string {
  const msg = String(rawMessage || '').trim();
  if (!msg) return '';
  const enQuoted = extractByPattern(msg, /^"(.+?)"\s+has been booked/i);
  if (enQuoted) return enQuoted;
  const enPlain = extractByPattern(msg, /^(.+?)\s+has been booked/i);
  if (enPlain) return enPlain;
  const ar = extractByPattern(msg, /تم\s+حجز\s+"?(.+?)"?(\s|\.|$)/);
  if (ar) return ar;
  return '';
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
      .map((c) =>
        c.age === 0 || c.age ? `${c.name} (${c.age} ${isAr ? 'سنة' : 'years'})` : c.name
      )
      .join(isAr ? '، ' : ', ');
  }
  if (!segment) return '';
  return segment
    .split(/,|،/)
    // Keep age text from old notifications, e.g. "Dana (5 years)"
    .map((p) => cleanChildNameTokens(p.trim()))
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

function modelFromFlexibleLabelText(labelEn?: string, labelAr?: string): string {
  const raw = String(labelEn || labelAr || '')
    .toLowerCase()
    .trim();
  if (!raw) return '';

  // English labels from expand payload: "Flexible - Daily", etc.
  const afterFlexible = raw.match(/flexible\s*-\s*([a-z]+)/i);
  if (afterFlexible?.[1]) {
    const token = afterFlexible[1].toLowerCase();
    if (KNOWN_BOOKING_MODELS.has(token)) return token;
  }

  for (const key of KNOWN_BOOKING_MODELS) {
    if (raw.includes(key)) return key;
  }
  if (raw.includes('دقائق')) return 'minutes';
  if (raw.includes('بالساعة')) return 'hourly';
  if (raw.includes('يومي')) return 'daily';
  if (raw.includes('أسبوعي')) return 'weekly';
  if (raw.includes('شهري')) return 'monthly';
  if (raw.includes('تجريبي')) return 'trial';
  if (raw.includes('ثابت')) return 'fixed';
  return '';
}

function modelFromChildBookingItem(item: any, detail?: any): string {
  const direct = pickKnownBookingModel(
    item?.booking_model,
    item?.booking_type,
    item?.model,
    item?.type,
    item?.raw?.booking_model,
    detail?.booking_model
  );
  if (direct) return direct;

  return modelFromFlexibleLabelText(item?.flexible_label_en, item?.flexible_label_ar);
}

function childBookingTypeChipLabel(item: any, isAr: boolean, _siblingCount: number, detail?: any): string {
  const model = modelFromChildBookingItem(item, detail);
  const bm = String(model || '').trim().toLowerCase();
  if (bm === 'fixed') return isAr ? 'ثابت' : 'Fixed';
  if (!bm || bm === 'unknown') return isAr ? 'حجز' : 'Booking';
  const sub = isAr ? MODEL_PILL_AR[bm] ?? bm : MODEL_PILL[bm] ?? bm;
  return isAr ? `مرن - ${sub}` : `Flexible - ${sub}`;
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

function metricIconAsset(icon: string): string {
  switch (icon) {
    case 'solar:tag-bold':
      return '/assets/icons/notification/BookingType.svg';
    case 'solar:clock-circle-bold':
      return '/assets/icons/notification/Duration.svg';
    case 'solar:clock-circle-bold-time':
      return '/assets/icons/notification/Time.svg';
    case 'solar:calendar-bold':
      return '/assets/icons/notification/Sessions.svg';
    default:
      return '';
  }
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
          bgcolor: 'transparent',
          flexShrink: 0,
        }}
      >
        {metricIconAsset(icon) ? (
          <Box
            component="img"
            src={metricIconAsset(icon)}
            alt={label}
            sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <Iconify icon={icon} width={20} style={{ color: BN.tealBody }} />
        )}
      </Box>
      <Stack spacing={0.35} sx={{ minWidth: 0, pt: 0.125 }}>
        <Typography sx={{ color: '#A29F9D', fontWeight: 500, fontSize: '16px', lineHeight: 1.25 }}>
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
        bgcolor: 'transparent',
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
        src="/assets/icons/notification/notification.svg"
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
      isAr ? data?.raw?.course_id?.name_ar : data?.raw?.course_id?.name_en,
      isAr ? data?.raw?.course_id?.name_en : data?.raw?.course_id?.name_ar,
      parseCourseNameFromMessage(messageForLang),
      parseCourseNameFromMessage(fallbackMsg),
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

    const listModel = pickKnownBookingModel(
      data?.raw?.booking_model,
      data?.booking_model,
      data?.booking_type,
      data?.actual_type
    );
    const listKnowsModel = Boolean(listModel);
    /** Fixed rows often omit child names in list copy ("1 Child"); prefetch expand on notifications page only. */
    const needsFixedChildNamePrefetch = variant === 'page' && listModel === 'fixed';

    if (prefetchedExpandKeyRef.current !== expandCacheKey) {
      prefetchedExpandKeyRef.current = expandCacheKey;
      lastLoadedExpandKeyRef.current = null;
      setExpanded(false);
      setDetail(undefined);
      setLoading(false);
    }

    if (listKnowsModel && !needsFixedChildNamePrefetch) {
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
  }, [
    expandCacheKey,
    expandIds,
    data?.notification_type,
    data?.raw?.booking_model,
    data?.booking_model,
    data?.booking_type,
    data?.actual_type,
    variant,
  ]);

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
      ? (detail.booking_items as any[])
          .map((i) => {
            const name = readChildName(i);
            const age = readChildAge(i);
            if (!name) return '';
            return age === 0 || age ? `${name} (${age} ${isAr ? 'سنة' : 'years'})` : name;
          })
          .filter((v) => Boolean(String(v || '').trim()))
          .join(isAr ? '، ' : ', ')
      : '';
  const fixedChildrenLine = fixedChildrenDisplay || fixedChildrenFromDetail;
  const childrenCountOnlyText = childrenCountPhrase(
    Math.max(
      childCountFromMessage,
      Array.isArray(detail?.booking_items) ? detail.booking_items.length : 0,
      groupedBookingCount
    ),
    isAr
  );
  /** Prefer real names from message/expand; keep count phrase only as fallback. */
  const fixedChildrenSummaryText =
    (fixedChildrenLine && fixedChildrenLine.trim()) ||
    (childrenCountOnlyText !== '—' ? childrenCountOnlyText : '');
  const displayCourseName =
    pickFirst(
      courseName,
      isAr ? detail?.program?.ar : detail?.program?.en,
      isAr ? detail?.program?.en : detail?.program?.ar
    ) || '—';

  const programLabel = isAr ? 'البرنامج' : 'Program';
  const centerLabel = isAr ? 'المركز' : 'Center';
  const parentLabel = isAr ? 'حجز بواسطة' : 'Booked by';
  const connectLabel = isAr ? 'التواصل' : 'Contact';
  const perChildTitle = isAr ? 'حجوزات لكل طفل' : 'Bookings Per Child';
  const bookedSessionsLabel = isAr ? 'الجلسات المحجوزة' : 'Booked Sessions';
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
                    borderRadius: '8px',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1.25, fontSize: '12px' },
                    bgcolor: '#E7F1FF',
                    color: '#2065B2',
                    pointerEvents: 'none',
                    '&:hover': { bgcolor: '#E7F1FF' },
                  }}
                />
              </Stack>
              <Typography sx={{ color: '#006C9C', lineHeight: 1.6, fontSize: '14px' }}>
                {courseHref ? (
                  <Link href={courseHref} style={{ fontWeight: 900, color: '#006C9C', textDecoration: 'none', fontSize: '15px' }}>
                    {displayCourseName}
                  </Link>
                ) : (
                  <Box component="strong" sx={{ fontWeight: '900 !important', color: '#006C9C', fontSize: '15px' }}>
                    {displayCourseName}
                  </Box>
                )}
                {fixedChildrenSummaryText ? (
                  <>
                    <Box component="span"> {isAr ? 'تم حجزها لـ' : 'has been booked for'} </Box>
                    <Box component="strong" sx={{ fontWeight: '900 !important', color: '#006C9C', fontSize: '15px' }}>
                      {fixedChildrenSummaryText}
                    </Box>
                  </>
                ) : (
                  <Box component="span"> {isAr ? 'تم حجزها' : 'has been booked'} </Box>
                )}
                <Box component="span"> {isAr ? 'بواسطة' : 'by'} </Box>
                <Box component="span" sx={{ color: '#006C9C', fontSize: '15px' }}>
                  {parentNameLine}
                </Box>
                .
              </Typography>
            </Stack>
          </Stack>
          <Typography
            dir={variant === 'list' ? undefined : 'ltr'}
            sx={{
              fontWeight: 600,
              fontSize: '14px',
              color: '#006C9C',
              whiteSpace: 'nowrap',
              pl: 1,
              ...(variant !== 'list' ? { direction: 'ltr', unicodeBidi: 'isolate' } : {}),
            }}
          >
            {variant === 'list'
              ? formattedDate
              : formatEnglishTimeLtr(data?.created_at)}
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
  const summaryChildrenText = childrenCountPhrase(nChildrenForSummary, isAr);

  const parentForSummary = parentNameLine;
  const showDesignedSummary =
    Boolean(displayCourseName) &&
    displayCourseName !== '—' &&
    Boolean(parentForSummary) &&
    parentForSummary !== '—' &&
    Boolean(summaryChildrenText) &&
    summaryChildrenText !== '—';

  const isFlexMultiVisual =
    childCountForChip > 1 ||
    mergedListCount > 1 ||
    /multiple|متعدد/i.test(headerChipText);

  const createdTime = fTime(data?.created_at);
  const allowCollapse = variant !== 'list';
  const rightEdgeDateOrTime =
    variant === 'list'
      ? formattedDate
      : formatEnglishTimeLtr(data?.created_at) || createdTime || '';

  return (
    <Paper sx={{ ...paperSx, position: 'relative' }}>
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
                  borderRadius: '8px',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1.25, fontSize: '12px' },
                  pointerEvents: 'none',
                  visibility: awaitingModelBootstrap ? 'hidden' : 'visible',
                  ...(isFixedTypeLabel(headerChipText, isAr)
                    ? { bgcolor: '#E7F1FF', color: '#2065B2', '&:hover': { bgcolor: '#E7F1FF' } }
                    : { bgcolor: '#F5E6FE', color: '#BE63F9', '&:hover': { bgcolor: '#F5E6FE' } }),
                }}
              />
            </Stack>

            {showDesignedSummary ? (
              <Typography
                sx={{ color: '#006C9C', fontWeight: 400, lineHeight: 1.65, pr: { xs: 0, sm: 0.5 }, fontSize: '14px' }}
              >
                {isAr ? (
                  <>
                    تم حجز{' '}
                    {courseHref ? (
                      <Link href={courseHref} style={{ color: '#006C9C', fontWeight: 900, textDecoration: 'none', fontSize: '15px' }}>
                        {'\u201C'}
                        {displayCourseName}
                        {'\u201D'}
                      </Link>
                    ) : (
                      <Box component="strong" sx={{ color: '#006C9C', fontWeight: '900 !important', fontSize: '15px' }}>
                        {'\u201C'}
                        {displayCourseName}
                        {'\u201D'}
                      </Box>
                    )}{' '}
                    لـ{' '}
                    <Box component="strong" sx={{ color: '#006C9C', fontWeight: '900 !important', fontSize: '15px' }}>
                      {summaryChildrenText}
                    </Box>{' '}
                    بواسطة{' '}
                    <Box component="span" sx={{ color: '#006C9C', fontSize: '15px' }}>
                      {'\u201C'}
                      {parentForSummary}
                      {'\u201D'}
                    </Box>
                    .
                  </>
                ) : (
                  <>
                    {courseHref ? (
                      <Link href={courseHref} style={{ color: '#006C9C', fontWeight: 900, textDecoration: 'none', fontSize: '15px' }}>
                        {'\u201C'}
                        {displayCourseName}
                        {'\u201D'}
                      </Link>
                    ) : (
                      <Box component="strong" sx={{ color: '#006C9C', fontWeight: '900 !important', fontSize: '15px' }}>
                        {'\u201C'}
                        {displayCourseName}
                        {'\u201D'}
                      </Box>
                    )}{' '}
                    has been booked for{' '}
                    <Box component="strong" sx={{ color: '#006C9C', fontWeight: '900 !important', fontSize: '15px' }}>
                      {summaryChildrenText}
                    </Box>{' '}
                    by{' '}
                    <Box component="span" sx={{ color: '#006C9C', fontSize: '15px' }}>
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

            {!awaitingModelBootstrap && allowCollapse ? (
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
                                src="/assets/icons/notification/Booked%20by.svg"
                                alt="booked by"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {parentLabel}
                              </Typography>
                              <Typography sx={{ color: '#2B509C', fontWeight: 400, fontSize: '14px' }}>
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
                                src="/assets/icons/notification/Contact.svg"
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
                                src="/assets/icons/notification/Program.svg"
                                alt="program"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {programLabel}
                              </Typography>
                              {courseHref ? (
                                <Link
                                  href={courseHref}
                                  style={{ color: '#2B509C', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
                                >
                                  {isAr ? detail.program?.ar ?? detail.program?.en : detail.program?.en ?? detail.program?.ar}
                                </Link>
                              ) : (
                                <Typography sx={{ color: '#2B509C', fontWeight: 600, fontSize: '14px' }}>
                                  {isAr ? detail.program?.ar ?? detail.program?.en : detail.program?.en ?? detail.program?.ar}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ px: 2.25, py: 1.75 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <InfoGridIconTile>
                              <Box
                                component="img"
                                src="/assets/icons/notification/Center.svg"
                                alt="center"
                                sx={{ width: 30, height: 30, objectFit: 'contain', display: 'block' }}
                              />
                            </InfoGridIconTile>
                            <Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: '#A29F9D', fontSize: '14px', minWidth: 90 }}>
                                {centerLabel}
                              </Typography>
                              <Typography sx={{ color: '#2B509C', fontWeight: 400, fontSize: '14px' }}>
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
                          borderRadius: '8px',
                          '& .MuiChip-label': { px: 1.25 },
                          pointerEvents: 'none',
                          '&:hover': { bgcolor: 'transparent' },
                        }}
                      />
                    ) : null}

                    <Typography
                      sx={{
                        color: BN.bookedSessionsTitle,
                        fontWeight: 700,
                        fontSize: '16px',
                        mt: 0.5,
                      }}
                    >
                      {perChildTitle}
                    </Typography>

                    <Stack spacing={2}>
                      {(detail.booking_items ?? []).map((item: any, idx: number) => {
                        const siblingCount = Math.max((detail.booking_items ?? []).length || 0, 1);
                        const typeLabel = childBookingTypeChipLabel(item, isAr, siblingCount, detail);
                        const childModel = modelFromChildBookingItem(item, detail);
                        const fixedType = childModel === 'fixed';
                        const hideDurationByModel =
                          childModel === 'daily' || childModel === 'weekly' || childModel === 'monthly';
                        const hideDurationByLabel = /daily|weekly|monthly|يومي|أسبوعي|شهري/i.test(typeLabel);
                        const hideDuration = hideDurationByModel || hideDurationByLabel;
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
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  flexShrink: 0,
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: '#F2EEFF',
                                }}
                              >
                                <Image
                                  src="/assets/icons/notification/notificationIcon.png"
                                  alt="notification"
                                  width={24}
                                  height={24}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  color: '#006C9C',
                                  fontWeight: 600,
                                  fontSize: '16px',
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
                                bgcolor: '#FFFFFF',
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
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        alignSelf: 'flex-start',
                                        '& .MuiChip-label': { px: 1.25, fontSize: '12px' },
                                        pointerEvents: 'none',
                                        bgcolor: fixedType ? '#E7F1FF' : '#F5E6FE',
                                        color: fixedType ? '#2065B2' : '#BE63F9',
                                        '&:hover': { bgcolor: fixedType ? '#E7F1FF' : '#F5E6FE' },
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
                                  <MetricCell icon="solar:clock-circle-bold-time" label={timeLabel}>
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
                                      fontSize: '16px',
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
                                              borderColor: '#E9ECEE',
                                              height: '100%',
                                            }}
                                          >
                                            <Stack direction="row" spacing={1.25} alignItems="flex-start">
                                              <Box
                                                component="img"
                                                src="/assets/icons/notification/CalendarShowingInBookedSessionCard.svg"
                                                alt="calendar"
                                                sx={{ width: '16.19px', height: '16.87px', objectFit: 'contain', display: 'block', mt: '2px' }}
                                              />
                                              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                                {parts.primary ? (
                                                  <Typography
                                                    sx={{
                                                      color: BN.sessionWeekdayText,
                                                      fontWeight: 600,
                                                      fontSize: '14px',
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
                                                      fontSize: '14px',
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
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              lineHeight: 1.6,
              fontSize: '14px',
              color: '#006C9C',
              position: 'absolute',
              top: 8,
              right: 18,
            }}
          >
            {rightEdgeDateOrTime}
          </Typography>
        ) : allowCollapse ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ position: 'absolute', top: 8, right: 18, flexShrink: 0 }}
          >
            <Typography
              dir="ltr"
              sx={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#006C9C',
                whiteSpace: 'nowrap',
                direction: 'ltr',
                unicodeBidi: 'isolate',
              }}
            >
              {rightEdgeDateOrTime}
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
        ) : (
          <Typography
            dir={variant === 'list' ? undefined : 'ltr'}
            sx={{
              fontWeight: 600,
              fontSize: '14px',
              color: '#006C9C',
              whiteSpace: 'nowrap',
              position: 'absolute',
              top: 8,
              right: 18,
              ...(variant !== 'list' ? { direction: 'ltr', unicodeBidi: 'isolate' } : {}),
            }}
          >
            {rightEdgeDateOrTime}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
