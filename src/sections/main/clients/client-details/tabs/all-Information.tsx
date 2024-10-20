'use client';

import { Box, Card, Container, Divider, ListItemText, Rating, Typography } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
type Props = {
  CenterInfo: any;
};
const AllInformation = ({ CenterInfo }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  console.log(CenterInfo);

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
            secondary={CenterInfo?.email}
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
            secondary={CenterInfo?.phone}
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
            secondary={CenterInfo?.children.length}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />

          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.INTERESTS')}
            secondary={CenterInfo?.client_fields
              .map((field: any) => {
                return i18n.language === 'ar' ? field.field.name_ar : field.field.name_en;
              })
              .join(', ')}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.CITY')}
            secondary={
              i18n.language === 'ar'
                ? CenterInfo?.neighborhood.city.name_ar
                : CenterInfo?.neighborhood.city.name_en
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.NEIGHBORHOOD')}
            secondary={
              i18n.language === 'ar'
                ? CenterInfo?.neighborhood.name_ar
                : CenterInfo?.neighborhood.name_en
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
        </Box>
      </Card>
    </Container>
  );
};

export default AllInformation;
