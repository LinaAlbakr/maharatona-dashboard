'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { RiyalIcon } from 'src/sections/main/centers/add-program/components/course-icons';

import {
  detailValueSx,
  specificDiscountCardSx,
  specificDiscountTableHeaderCellSx,
  specificDiscountTableHeaderSx,
  specificDiscountTableRowSx,
} from '../styles';
import { getLocalizedText } from '../utils';

type PackageRow = {
  title_ar?: string;
  title_en?: string;
  number_of_classes?: number | string;
  price?: number | string;
};

type Props = {
  packages: PackageRow[];
  isArabic: boolean;
};

export default function FlexiblePackagesTable({ packages, isArabic }: Props) {
  const { t } = useTranslate();

  if (!packages.length) return null;

  return (
    <Box sx={specificDiscountCardSx}>
      <Box sx={{ ...specificDiscountTableHeaderSx, gridTemplateColumns: '1.2fr 1fr 1fr' }}>
        <Typography sx={specificDiscountTableHeaderCellSx}>
          {t('PROGRAM_DETAILS.PACKAGE_TITLE')}
        </Typography>
        <Typography sx={{ ...specificDiscountTableHeaderCellSx, textAlign: 'center' }}>
          {t('PROGRAM_DETAILS.NO_OF_SESSIONS')}
        </Typography>
        <Typography sx={{ ...specificDiscountTableHeaderCellSx, textAlign: 'right' }}>
          {t('LABEL.PRICE')}
        </Typography>
      </Box>

      {packages.map((pkg, index) => (
        <Box
          key={index}
          sx={{
            ...specificDiscountTableRowSx,
            gridTemplateColumns: '1.2fr 1fr 1fr',
          }}
        >
          <Typography sx={detailValueSx}>
            {getLocalizedText(isArabic, pkg.title_ar, pkg.title_en)}
          </Typography>
          <Typography sx={{ ...detailValueSx, textAlign: 'center' }}>
            {pkg.number_of_classes ?? '-'}
          </Typography>
          <Box
            sx={{
              ...detailValueSx,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.75,
            }}
          >
            {pkg.price != null && pkg.price !== '' ? (
              <>
                <RiyalIcon />
                <span>{Math.floor(Number(pkg.price))}</span>
              </>
            ) : (
              '-'
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
