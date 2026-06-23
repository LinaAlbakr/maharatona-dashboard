'use client';

import { Box, Card, Container, Divider, Link, ListItemText, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
import { arabicDateTime, englishDateTime } from 'src/utils/format-time';
import ProgramPicturesGallery from 'src/sections/main/courses/course-details/components/program-pictures-gallery';

const isImageAttachment = (url: string) =>
  /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url.split('?')[0] ?? url);

const TechnicalSupportDetailsView = ({ ItemInfo }: any) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();

  const attachments = useMemo(
    () =>
      (Array.isArray(ItemInfo?.attachments) ? ItemInfo.attachments : []).filter(
        (url: unknown) => typeof url === 'string' && url.trim()
      ),
    [ItemInfo?.attachments]
  );

  const imageAttachments = useMemo(
    () => attachments.filter((url: string) => isImageAttachment(url)),
    [attachments]
  );

  const fileAttachments = useMemo(
    () => attachments.filter((url: string) => !isImageAttachment(url)),
    [attachments]
  );

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
              return i18n.language === 'ar' ? arabicDateTime(dateValue) : englishDateTime(dateValue);
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
          {attachments.length > 0 && (
            <Box sx={{ gridColumn: '1 / -1', pb: 3 }}>
              <ListItemText
                sx={{ color: 'primary.common', mb: 1 }}
                primary={t('LABEL.ATTACHMENTS')}
                primaryTypographyProps={{ fontWeight: '700' }}
              />
              {imageAttachments.length > 0 && (
                <ProgramPicturesGallery images={imageAttachments} hideTitle />
              )}
              {fileAttachments.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {fileAttachments.map((url: string, index: number) => (
                    <Link
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: 'info.dark', fontSize: '14px', wordBreak: 'break-all' }}
                    >
                      {url}
                    </Link>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default TechnicalSupportDetailsView;
