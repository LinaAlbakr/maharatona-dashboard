'use client';

import { Box, Card, Container, Divider, ListItemText, Typography } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
type Props = {
  ClientInfo: any;
};
const AllInformation = ({ ClientInfo }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Card
        sx={{
          minHeight: '100px',
          mb: 2,
          py: 2,
        }}
      >
        <Typography variant="h5" color="secondary" sx={{ px: 4 }}>
          {t('LABEL.ABOUT_CLIENT')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr  repeat(2, 1fr)', gap: 4, px: 2 }}>
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.EMAIL')}
            secondary={ClientInfo?.email}
            secondaryTypographyProps={{
              color: 'info.dark',
              fontSize: '12px',
              dir: 'ltr',
              textAlign: 'left',
            }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.PHONE')}
            secondary={ClientInfo?.phone}
            secondaryTypographyProps={{
              color: 'info.dark',
              fontSize: '12px',
              dir: 'ltr',
              textAlign: 'left',
            }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.NUMBER_OF_CHILDREN')}
            secondary={ClientInfo?.total_children || ClientInfo?.child?.length || 0}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />

          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.INTERESTS')}
            secondary={ClientInfo?.field
              ?.map((field: any) => {
                return i18n.language === 'ar' ? field.name_ar : field.name_en;
              })
              .join(', ') || '-'}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.CITY')}
            secondary={
              typeof ClientInfo?.city === 'string'
                ? ClientInfo?.city
                : i18n.language === 'ar'
                  ? ClientInfo?.city?.name_ar
                  : ClientInfo?.city?.name_en || '-'
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.NEIGHBORHOOD')}
            secondary={
              typeof ClientInfo?.neighborhood === 'string'
                ? ClientInfo?.neighborhood
                : i18n.language === 'ar'
                  ? ClientInfo?.neighborhood?.name_ar
                  : ClientInfo?.neighborhood?.name_en || '-'
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
        </Box>
      </Card>
    </Container>
  );
};

export default AllInformation;
