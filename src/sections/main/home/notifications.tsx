'use client';

import { Box, Card, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useSettingsContext } from 'src/components/settings';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import NotificationItem from './notification-item';
import FormProvider from 'src/components/hook-form';
import CutomAutocompleteView from 'src/components/AutoComplete/CutomAutocompleteView';
import { useTranslate } from 'src/locales';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { NOTIFICATION_TYPES } from '../notifications/constants';
import { groupAdminNewBookingNotifications } from '../notifications/group-admin-booking-notifications';
import { useAdminBookingRealtimeRefresh } from 'src/hooks/use-admin-booking-realtime';
type Props = {
  notifications: any;
};

const NotificationView = ({ notifications }: Props) => {
  const settings = useSettingsContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslate();
  useAdminBookingRealtimeRefresh();

  const formDefaultValues = {
    name: '',
    date: '',
  };

  const methods = useForm({
    defaultValues: formDefaultValues,
  });

  const { control } = methods;

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

      if (name === 'select_date' || name === 'notification_type') {
        params.set('notifications_page', '1');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleRowsPerPageChange = (nextLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('notifications_limit', String(nextLimit));
    params.set('notifications_page', '1');
    router.push(`${pathname}?${params.toString()}`);
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
            xs: 'repeat(2 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
          sx={{ width: '50%', mx: 'auto' }}
        >
          <CutomAutocompleteView
            items={NOTIFICATION_TYPES as any[]}
            label={t('LABEL.TYPE')}
            placeholder={t('LABEL.TYPE')}
            name="type"
            onCustomChange={(selectedType: any) =>
              createQueryString('notification_type', selectedType?.value ?? '')
            }
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
                  /* actionBar: { actions: ['clear'] }, */
                }}
              />
            )}
          />
        </Box>
      </FormProvider>
      {notifications.data.length === 0 ? (
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
      {notifications.data.length > 0 && (
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
