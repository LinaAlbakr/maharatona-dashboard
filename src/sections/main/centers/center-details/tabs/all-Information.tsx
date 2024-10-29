'use client';

import { Box, Card, Container, Divider, ListItemText, Rating, Typography } from '@mui/material';
import Image from 'next/image';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
type Props = {
  CenterInfo: any;
};
const AllInformation = ({ CenterInfo }: Props) => {
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
          {t('LABEL.ABOUT_CENTER')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: '1.2fr  repeat(5, 1fr)',
            },
            gap: 4,
            px: 2,
          }}
        >
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.DESCRIPTION')}
            secondary={
              i18n.language === 'ar' ? CenterInfo?.description_ar : CenterInfo?.description_en
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.WEBSITE')}
            secondary={
              <a href={`https://${CenterInfo?.website}`} target="_blank" rel="noopener noreferrer">
                {CenterInfo?.website}
              </a>
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.LOCATION')}
            secondary={
              <a
                href={`https://www.google.com/maps?q=${CenterInfo.latitude},${CenterInfo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('LABEL.CENTER_LOCATION')}{' '}
                <Iconify width={12} icon="pajamas:earth" color={'info.dark'} />
              </a>
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
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
            primary={t('LABEL.COURSES_NUMBER')}
            secondary={CenterInfo?.courses_count}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.LOCATION_DESCRIPTION')}
            secondary={CenterInfo?.place_description}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.FIELDS')}
            secondary={CenterInfo?.center_fields
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
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.BANK_ACCOUNT')}
            secondary={CenterInfo?.bank_account_number}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.NUMBER_OF_REGISTRANTS')}
            secondary={CenterInfo?.registered_courses_count}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.TOTAL_RATE')}
            secondary={<Rating value={+CenterInfo.average_rate} precision={0.5} readOnly />}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
        </Box>
      </Card>
      <Card
        sx={{
          minHeight: '300px',
          py: 2,
          m: 0,
          px: 0,
        }}
      >
        <Typography variant="h5" color="secondary" sx={{ px: 4 }}>
          {t('LABEL.IMAGES')}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            flexDirection: { xs: 'column', sm: 'column', md: 'row ' },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Image
              src={CenterInfo?.commercial_register || '/assets/images/centers/gray.jpeg'}
              width={250}
              height={250}
              alt="image"
              style={{
                borderRadius: '10px',
              }}
            />
            <Typography variant="body1" color="info.dark">
              {t('LABEL.COMMERIAL_REGISTER')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Image
              src={CenterInfo?.bank_account_image || '/assets/images/centers/gray.jpeg'}
              width={250}
              height={250}
              alt="image"
              style={{
                borderRadius: '10px',
              }}
            />
            <Typography variant="body1" color="info.dark">
              {t('LABEL.BANK_ACCOUNT_IMAGE')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                height: 'fit-content',
              }}
            >
              <Image
                src={CenterInfo?.center_images[0].url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />{' '}
              <Image
                src={CenterInfo?.center_images[1]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />{' '}
              <Image
                src={CenterInfo?.center_images[2]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />{' '}
              <Image
                src={CenterInfo?.center_images[3]?.url || '/assets/images/centers/gray.jpeg'}
                width={120}
                height={120}
                alt="image"
                style={{
                  borderRadius: '10px',
                }}
              />
            </Box>
            <Typography variant="body1" color="info.dark">
              {t('LABEL.CENTER_IMAGES')}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default AllInformation;
