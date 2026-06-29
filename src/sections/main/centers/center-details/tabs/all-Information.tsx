'use client';

import { useMemo } from 'react';
import Image from 'next/image';

import { Box, Card, Rating, Divider, Container, Typography, ListItemText } from '@mui/material';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';
import Lightbox, { useLightBox } from 'src/components/lightbox';
import { useSettingsContext } from 'src/components/settings';
import {
  profileDetailFieldSx,
  profileDetailImageLabelSx,
  profileDetailSectionTitleSx,
  profileDetailValueTypographyProps,
  profileDetailValueTypographyPropsLtr,
} from 'src/sections/main/profile-details-styles';
import { FIELD_CONTENT_COLOR } from 'src/sections/main/centers/add-program/constants';

type Props = {
  CenterInfo: any;
};
const AllInformation = ({ CenterInfo }: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();

  const notAvailable = t('LABEL.NOT_AVAILABLE');
  const centerDescription =
    (i18n.language === 'ar' ? CenterInfo?.desc_ar : CenterInfo?.desc_en)?.trim() || notAvailable;

  const placeholderImage = '/assets/images/centers/gray.jpeg';
  const commercialRegisterImage =
    CenterInfo?.commercial_register_image?.trim() || placeholderImage;
  const bankImage = CenterInfo?.bank_image?.trim() || placeholderImage;
  const centerImage = CenterInfo?.center_image?.trim() || placeholderImage;

  const slides = useMemo(
    () => [centerImage, commercialRegisterImage, bankImage].map((src) => ({ src })),
    [centerImage, commercialRegisterImage, bankImage]
  );
  const lightbox = useLightBox(slides);

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
        <Typography variant="h5" sx={profileDetailSectionTitleSx}>
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
            sx={profileDetailFieldSx}
            primary={t('LABEL.CENTER_DESCRIPTION')}
            secondary={centerDescription}
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.WEBSITE')}
            secondary={
              CenterInfo?.website ? (
                <a
                  href={
                    CenterInfo.website.startsWith('http')
                      ? CenterInfo.website
                      : `https://${CenterInfo.website.trim()}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: FIELD_CONTENT_COLOR }}
                >
                  {CenterInfo.website.trim()}
                </a>
              ) : (
                notAvailable
              )
            }
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />

          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.LOCATION')}
            secondary={
              <a
                href={`https://www.google.com/maps?q=${CenterInfo.latitude},${CenterInfo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: FIELD_CONTENT_COLOR }}
              >
                {t('LABEL.CENTER_LOCATION')}{' '}
                <Iconify width={12} icon="pajamas:earth" color={FIELD_CONTENT_COLOR} />
              </a>
            }
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.PHONE')}
            secondary={CenterInfo?.phone}
            secondaryTypographyProps={profileDetailValueTypographyPropsLtr}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.EMAIL')}
            secondary={CenterInfo?.email || notAvailable}
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />

          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.NO_OF_PROGRAMS')}
            secondary={CenterInfo?.total_courses ?? 0}
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.LOCATION_DESCRIPTION')}
            secondary={CenterInfo?.place_desc || notAvailable}
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.CATEGORIES')}
            secondary={
              Array.isArray(CenterInfo?.fields)
                ? CenterInfo.fields
                    .map((field: any) =>
                      i18n.language === 'ar' ? field?.name_ar : field?.name_en
                    )
                    .filter(Boolean)
                    .join(', ') || notAvailable
                : notAvailable
            }
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.CITY')}
            secondary={
              (i18n.language === 'ar' ? CenterInfo?.city?.name_ar : CenterInfo?.city?.name_en) ||
              notAvailable
            }
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />

          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.NEIGHBORHOOD')}
            secondary={
              (i18n.language === 'ar'
                ? CenterInfo?.neighborhood?.name_ar
                : CenterInfo?.neighborhood?.name_en) || notAvailable
            }
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.BANK_ACCOUNT')}
            secondary={CenterInfo?.bank_account_number}
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.NO_OF_REGISTRANTS')}
            secondary={CenterInfo?.total_registrants ?? notAvailable}
            secondaryTypographyProps={profileDetailValueTypographyProps}
          />
          <ListItemText
            sx={profileDetailFieldSx}
            primary={t('LABEL.RATING')}
            secondary={<Rating value={CenterInfo?.avg_rate || 0} precision={0.5} readOnly />}
            secondaryTypographyProps={profileDetailValueTypographyProps}
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
        <Typography variant="h5" sx={profileDetailSectionTitleSx}>
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
            <Box onClick={() => lightbox.onOpen(centerImage)} sx={imageWrapperSx}>
              <Image
                src={centerImage}
                width={250}
                height={250}
                alt="Center"
                style={{ borderRadius: '10px', objectFit: 'cover' }}
              />
            </Box>
            <Typography variant="body1" sx={profileDetailImageLabelSx}>
              {t('LABEL.CENTER_IMAGES')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              onClick={() => lightbox.onOpen(commercialRegisterImage)}
              sx={imageWrapperSx}
            >
              <Image
                src={commercialRegisterImage}
                width={250}
                height={250}
                alt="Commercial Register"
                style={{ borderRadius: '10px', objectFit: 'cover' }}
              />
            </Box>
            <Typography variant="body1" sx={profileDetailImageLabelSx}>
              {t('LABEL.COMMERCIAL_REGISTER_IMAGE')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box onClick={() => lightbox.onOpen(bankImage)} sx={imageWrapperSx}>
              <Image
                src={bankImage}
                width={250}
                height={250}
                alt="Bank Account"
                style={{ borderRadius: '10px', objectFit: 'cover' }}
              />
            </Box>
            <Typography variant="body1" sx={profileDetailImageLabelSx}>
              {t('LABEL.BANK_IBAN_IMAGE')}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        disabledVideo
        disabledCaptions
        disabledSlideshow
      />
    </Container>
  );
};

const imageWrapperSx = {
  cursor: 'pointer',
  borderRadius: '10px',
  lineHeight: 0,
  transition: (theme: any) => theme.transitions.create(['opacity', 'box-shadow']),
  '&:hover': {
    opacity: 0.9,
    boxShadow: (theme: any) => theme.shadows[4],
  },
};

export default AllInformation;
