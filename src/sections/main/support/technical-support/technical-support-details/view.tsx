'use client';

import { Box, Card, Container, Divider, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
import { arabicDate, englishDate } from 'src/utils/format-time';

const TechnicalSupportDetailsView = ({ ItemInfo }: any) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important', minHeight: '90%' }}
    >
      <Card sx={{ height: '100%' }}>
        <Typography variant="h4" color="secondary" sx={{ pt: 2, pl: 2 }}>
          {t('LABEL.TECHNICAL_SUPPORT')}
        </Typography>
        <Divider sx={{ my: 2, mr: 6 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',

            gap: 6,
            px: 2,
          }}
        >
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.common' }}
            primary={t('LABEL.NAME')}
            secondary={ItemInfo?.name}
            primaryTypographyProps={{ fontWeight: '700' }}
            secondaryTypographyProps={{
              color: 'info.dark',
              fontSize: '14px',
              dir: 'ltr',
              textAlign: 'left',
            }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.common' }}
            primary={t('LABEL.DATE')}
            secondary={(() => {
              const dateValue = ItemInfo?.createdAt ?? ItemInfo?.date;
              if (!dateValue) return '';
              return i18n.language === 'ar' ? arabicDate(dateValue) : englishDate(dateValue);
            })()}
            primaryTypographyProps={{ fontWeight: '700' }}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '14px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.common' }}
            primary={t('LABEL.TYPE')}
            secondary={ItemInfo?.type}
            primaryTypographyProps={{ fontWeight: '700' }}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '14px' }}
          />

          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.common' }}
            primary={t('LABEL.EMAIL')}
            secondary={ItemInfo?.email}
            primaryTypographyProps={{ fontWeight: '700' }}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '14px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.common' }}
            primary={t('LABEL.REASON_TITLE')}
            secondary={i18n.language === 'ar' ? ItemInfo?.reasonTitle.name_ar : ItemInfo?.reasonTitle.name_en}
            primaryTypographyProps={{ fontWeight: '700' }}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '14px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.common' }}
            primary={t('LABEL.DESCRIPTION')}
            secondary={ItemInfo?.desc}
            primaryTypographyProps={{ fontWeight: '700' }}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '14px' }}
          />
        </Box>
      </Card>
    </Container>
  );
};

export default TechnicalSupportDetailsView;
