'use client';

import { Box, Card, FormControl, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import NotificationItem from './notification-item';
import FormProvider from 'src/components/hook-form';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import { useTranslate } from 'src/locales';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { format, isValid, parseISO } from 'date-fns';
import { NOTIFICATION_TYPES } from '../notifications/constants';
import { groupAdminNewBookingNotifications } from '../notifications/group-admin-booking-notifications';

const parseDateParam = (value: unknown) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const parsed = parseISO(String(value));
  return isValid(parsed) ? parsed : null;
};
type Props = {
  notifications: any;
};

const NotificationView = ({ notifications }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslate();

  const notificationTypeParam = searchParams.get('notification_type');
  const selectDateParam = searchParams.get('select_date');
  const searchParam = searchParams.get('search') || '';

  const selectedTypeOption = useMemo(
    () => NOTIFICATION_TYPES.find((item) => item.value === notificationTypeParam) ?? null,
    [notificationTypeParam]
  );

  const methods = useForm({
    defaultValues: {
      type: selectedTypeOption,
      date: selectDateParam ?? '',
      search: searchParam,
    },
  });

  const { control, setValue } = methods;

  useEffect(() => {
    setValue('type', selectedTypeOption);
  }, [selectedTypeOption, setValue]);

  useEffect(() => {
    setValue('date', selectDateParam ?? '');
  }, [selectDateParam, setValue]);

  useEffect(() => {
    setValue('search', searchParam);
  }, [searchParam, setValue]);

  const displayNotifications = useMemo(
    () => groupAdminNewBookingNotifications(notifications?.data ?? []),
    [notifications?.data]
  );

  const rowsPerPage = Number(searchParams.get('notifications_limit')) || notifications?.meta?.limit || 6;

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

      if (name === 'select_date' || name === 'notification_type' || name === 'search') {
        params.set('notifications_page', '1');
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleRowsPerPageChange = (nextLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('notifications_limit', String(nextLimit));
    params.set('notifications_page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applySearch = (value: string) => {
    createQueryString('search', value.trim());
  };

  return (
    <Card sx={{ p: 2, mt: 3 }}>
      <Typography variant="h4" color="secondary">
        {t('LABEL.NOTIFICATIONS')}
      </Typography>
      <FormProvider methods={methods}>
        <Box
          rowGap={1}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, minmax(0, 1fr))',
          }}
          sx={{ width: { xs: '100%', md: '75%' }, mx: 'auto', mt: 2 }}
        >
          <CutomAutocompleteView
            items={NOTIFICATION_TYPES as any[]}
            label={t('LABEL.TYPE')}
            placeholder={t('LABEL.TYPE')}
            name="type"
            value={selectedTypeOption}
            onCustomChange={(selectedType: any) =>
              createQueryString('notification_type', selectedType?.value ?? '')
            }
          />
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('LABEL.SEARCH')}
                placeholder={t('LABEL.SEARCH_PROGRAM_OR_CENTER')}
                fullWidth
                onChange={(e) => field.onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applySearch(String(field.value || ''));
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
                value={parseDateParam(field.value)}
                onChange={(newValue) => {
                  const normalized =
                    newValue && isValid(newValue) ? format(newValue, 'yyyy-MM-dd') : '';
                  field.onChange(normalized);
                  createQueryString('select_date', newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!error,
                    helperText: error?.message,
                  },
                  actionBar: { actions: ['clear', 'today'] },
                }}
              />
            )}
          />
        </Box>
      </FormProvider>
      {displayNotifications.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 4 }} color="secondary">
          {' '}
          {t('LABEL.NO_NOTIFICATIONS')}
        </Typography>
      ) : (
        <Stack
          sx={{
            display: 'flex',
            py: 4,
            gap: 2,
          }}
        >
          {displayNotifications.map((data: any) => {
            const rowKey =
              Array.isArray(data?._groupedBookingIds) && data._groupedBookingIds.length
                ? `grp:${data._groupedBookingIds.join('-')}`
                : String(data?.id ?? '');
            return <NotificationItem key={rowKey} data={data} />;
          })}
        </Stack>
      )}
      {displayNotifications.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1.25} sx={{ py: 1 }}>
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
      )}
    </Card>
  );
};

export default NotificationView;
