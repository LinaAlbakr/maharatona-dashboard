'use client';

import {
  alpha,
  Box,
  Card,
  Container,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, isValid } from 'date-fns';
import { Fragment, useCallback, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import FormProvider from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import NotificationCard from './notification-card';
import { groupAdminNewBookingNotifications } from './group-admin-booking-notifications';
import { useAdminBookingRealtimeRefresh } from 'src/hooks/use-admin-booking-realtime';

const BOOKING_MODEL_FILTERS = [
  { name_en: 'Fixed', name_ar: 'ثابت', value: 'fixed' },
  { name_en: 'Flexible', name_ar: 'مرن', value: 'flexible' },
];

type Props = {
  notifications: any;
};

const getDayGroupKey = (createdAt: string | Date | undefined) => {
  const d = createdAt ? new Date(createdAt) : null;
  if (!d || !isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
};

const formatDayHeading = (createdAt: string | Date | undefined) => {
  const d = createdAt ? new Date(createdAt) : null;
  if (!d || !isValid(d)) return '';
  if (i18n.language === 'ar') {
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return format(d, 'MMMM d, yyyy');
};

const isBookingNotification = (n: any) => {
  const t = String(
    n?.notification_type ??
      n?.raw?.notification_type ??
      n?.actual_type ??
      n?.booking_type ??
      ''
  )
    .trim()
    .toUpperCase();
  if (t === 'ADMIN_NEW_BOOKING') return true;
  // defensive fallback for rows where type is missing but booking model exists
  const bookingModel = String(n?.raw?.booking_model ?? n?.booking_type ?? '').trim();
  return bookingModel.length > 0;
};

export default function NotificationsView({ notifications }: Readonly<Props>) {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslate();
  useAdminBookingRealtimeRefresh();

  const displayNotifications = useMemo(
    () =>
      groupAdminNewBookingNotifications(notifications?.data ?? []).filter(
        (n: any) => isBookingNotification(n)
      ),
    [notifications?.data]
  );
  const formDefaultValues = {
    type: '',
    date: '',
    search: searchParams.get('search') || '',
  };

  const methods = useForm({
    defaultValues: formDefaultValues,
  });

  const { control } = methods;
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowsPerPage = Number(searchParams.get('notifications_limit')) || notifications?.meta?.limit || 20;

  const createQueryString = useCallback(
    (name: string, value: number | Date | null | string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        if (name === 'select_date') {
          params.set(name, format(value as Date, 'yyyy-MM-dd'));
        } else {
          params.set(name, String(value));
        }
      } else {
        params.delete(name);
      }

      // Any filter/search change should restart pagination from first page.
      if (name === 'search' || name === 'select_date' || name === 'booking_model_type') {
        params.set('notifications_page', '1');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleRowsPerPageChange = (nextLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('notifications_limit', String(nextLimit));
    // Reset to first page whenever page size changes.
    params.set('notifications_page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ px: { xs: 1, md: 2 } }}>
      <Box
        sx={{
          backgroundImage: 'linear-gradient(rgba(0, 47, 73, 0.92), rgba(0, 47, 73, 0.82))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 3,
          p: { xs: 2, md: 5 },
          minHeight: { xs: 220, md: 280 },
          mb: 3,
        }}
      >
        <Typography variant="h2" color="white" textAlign="center" sx={{ mb: 3, fontSize: { xs: 30, md: 44 } }}>
          {t('LABEL.NOTIFICATIONS')}
        </Typography>

        <Card sx={{ p: { xs: 1.5, md: 2 }, maxWidth: 900, mx: 'auto', borderRadius: 2.5 }}>
          <FormProvider methods={methods}>
            <Box
              rowGap={1.5}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                md: 'repeat(3, minmax(0, 1fr))',
              }}
            >
              <CutomAutocompleteView
                items={BOOKING_MODEL_FILTERS as any[]}
                label={t('LABEL.TYPE')}
                placeholder={t('LABEL.TYPE')}
                name="type"
                onCustomChange={(selectedType: any) =>
                  createQueryString('booking_model_type', selectedType?.value ?? '')
                }
              />
              <Controller
                name="search"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('LABEL.SEARCH')}
                    placeholder="Search by parent, program"
                    fullWidth
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                      searchDebounceRef.current = setTimeout(() => {
                        createQueryString('search', String(value || '').trim());
                      }, 350);
                    }}
                    onBlur={() => createQueryString('search', String(field.value || '').trim())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        createQueryString('search', String(field.value || '').trim());
                      }
                    }}
                  />
                )}
              />

              <Controller
                name="date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label={t('LABEL.DATE')}
                    format="dd-MM-yyyy"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                      createQueryString('select_date', newValue);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Box>
          </FormProvider>
        </Card>
      </Box>

      {notifications?.data?.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 4 }} color="secondary">
          {t('LABEL.NO_NOTIFICATIONS')}
        </Typography>
      ) : (
        <Stack sx={{ py: 1.5, gap: 1.5, mb: 1 }}>
          {displayNotifications.map((item: any, index: number) => {
            const list = displayNotifications;
            const prev = index > 0 ? list[index - 1] : null;
            const showDayHeader = getDayGroupKey(prev?.created_at) !== getDayGroupKey(item?.created_at);
            const rowKey =
              Array.isArray(item?._groupedBookingIds) && item._groupedBookingIds.length
                ? `grp:${item._groupedBookingIds.join('-')}`
                : String(item?.id ?? index);
            return (
              <Fragment key={rowKey}>
                {showDayHeader ? (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: index ? 1 : 0, pb: 0.25 }}>
                    <Box
                      component="img"
                      src="/assets/icons/notification/DateCalendar.svg"
                      alt="date"
                      sx={{ width: 20, height: 20, objectFit: 'contain', display: 'block', flexShrink: 0 }}
                    />
                    <Typography
                      sx={{ color: '#006C9C', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', lineHeight: 1.2 }}
                    >
                      {formatDayHeading(item?.created_at)}
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        height: 1.5,
                        borderRadius: 999,
                        bgcolor: (theme) => alpha(theme.palette.grey[600], 0.2),
                        mt: '1px',
                      }}
                    />
                  </Stack>
                ) : null}
                <NotificationCard data={item} />
              </Fragment>
            );
          })}
        </Stack>
      )}

      {notifications?.data?.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ py: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 96 }}>
              <Select
                value={String(rowsPerPage)}
                onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                sx={{ borderRadius: 2.5 }}
              >
                {[6, 10, 20, 50].map((n) => (
                  <MenuItem key={n} value={String(n)}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

        </Stack>
      )}
    </Container>
  );
}
