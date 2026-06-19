'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import {
  detailValueSx,
  sessionNestedCardSx,
  specificDiscountTableHeaderCellSx,
  specificDiscountTableHeaderSx,
  specificDiscountTableRowSx,
} from '../styles';
import { getLocalizedText } from '../utils';
import PriceWithDiscountValue from './price-with-discount-value';

type PackageRow = {
  title_ar?: string;
  title_en?: string;
  number_of_classes?: number | string;
  price?: number | string;
};

type Props = {
  packages: PackageRow[];
  isArabic: boolean;
  course?: any;
};

export default function FlexiblePackagesTable({ packages, isArabic, course }: Props) {
  const { t } = useTranslate();

  if (!packages.length) return null;

  const packagesTableGridSx = {
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
  };

  return (
    <Box sx={sessionNestedCardSx}>
      <Box sx={{ ...specificDiscountTableHeaderSx, ...packagesTableGridSx }}>
        <Typography sx={{ ...specificDiscountTableHeaderCellSx, textAlign: 'left' }}>
          {t('PROGRAM_DETAILS.PACKAGE_TITLE')}
        </Typography>
        <Typography sx={{ ...specificDiscountTableHeaderCellSx, textAlign: 'left' }}>
          {t('PROGRAM_DETAILS.NO_OF_SESSIONS')}
        </Typography>
        <Typography sx={{ ...specificDiscountTableHeaderCellSx, textAlign: 'left' }}>
          {t('LABEL.PRICE')}
        </Typography>
      </Box>

      {packages.map((pkg, index) => (
        <Box
          key={index}
          sx={{
            ...specificDiscountTableRowSx,
            ...packagesTableGridSx,
          }}
        >
          <Typography sx={detailValueSx}>
            {getLocalizedText(isArabic, pkg.title_ar, pkg.title_en)}
          </Typography>
          <Typography sx={detailValueSx}>{pkg.number_of_classes ?? '-'}</Typography>
          <PriceWithDiscountValue amount={pkg.price} course={course} />
        </Box>
      ))}
    </Box>
  );
}
