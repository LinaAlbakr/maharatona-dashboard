'use client';

import Image from 'next/image';

import { Box, Card, Rating, Divider, Container, Typography, ListItemText } from '@mui/material';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

type Props = {
  CenterInfo: any;
};
const AllInformation = ({ CenterInfo }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  const notAvailable = t('LABEL.NOT_AVAILABLE');
  const centerDescription =
    (i18n.language === 'ar' ? CenterInfo?.desc_ar : CenterInfo?.desc_en)?.trim() || notAvailable;

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
            primary={t('LABEL.CENTER_DESCRIPTION')}
            secondary={centerDescription}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.WEBSITE')}
            secondary={
              CenterInfo?.website ? (
                <a href={CenterInfo.website.startsWith('http') ? CenterInfo.website : `https://${CenterInfo.website.trim()}`}
                  target="_blank" rel="noopener noreferrer">
                  {CenterInfo.website.trim()}
                </a>
              ) : notAvailable
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
                <Iconify width={12} icon="pajamas:earth" color="info.dark" />
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
            primary={t('LABEL.EMAIL')}
            secondary={CenterInfo?.email || notAvailable}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />

          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.NO_OF_PROGRAMS')}
            secondary={CenterInfo?.total_courses ?? 0}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.LOCATION_DESCRIPTION')}
            secondary={CenterInfo?.place_desc || notAvailable}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.CATEGORIES')}
            secondary={
              Array.isArray(CenterInfo?.fields)
                ? CenterInfo.fields
                  .map((field: any) => (i18n.language === 'ar' ? field?.name_ar : field?.name_en))
                  .filter(Boolean)
                  .join(', ') || notAvailable
                : notAvailable
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.CITY')}
            secondary={
              (i18n.language === 'ar' ? CenterInfo?.city?.name_ar : CenterInfo?.city?.name_en) ||
              notAvailable
            }
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />

          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.NEIGHBORHOOD')}
            secondary={
              (i18n.language === 'ar'
                ? CenterInfo?.neighborhood?.name_ar
                : CenterInfo?.neighborhood?.name_en) || notAvailable
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
            primary={t('LABEL.NO_OF_REGISTRANTS')}
            secondary={CenterInfo?.total_registrants ?? notAvailable}
            secondaryTypographyProps={{ color: 'info.dark', fontSize: '12px' }}
          />
          <ListItemText
            sx={{ gridColumn: 'span', color: 'primary.main' }}
            primary={t('LABEL.RATING')}
            secondary={<Rating value={CenterInfo?.avg_rate || 0} precision={0.5} readOnly />}
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
              src={CenterInfo?.commercial_register_image?.trim() || '/assets/images/centers/gray.jpeg'}
              width={250}
              height={250}
              alt="Commercial Register"
              style={{ borderRadius: '10px' }}
            />
            <Typography variant="body1" color="info.dark">
              {t('LABEL.COMMERIAL_REGISTER')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Image
              src={CenterInfo?.bank_image?.trim() || '/assets/images/centers/gray.jpeg'}
              width={250}
              height={250}
              alt="Bank Account"
              style={{ borderRadius: '10px' }}
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
                src={CenterInfo?.center_image?.trim() || '/assets/images/centers/gray.jpeg'}
                width={250}
                height={250}
                alt="Center"
                style={{ borderRadius: '10px' }}
              />
              {/* <Image
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
              /> */}
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
