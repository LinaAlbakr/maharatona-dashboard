'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import {
  detailValueSx,
  discountValueBoxSx,
  specificDiscountCardSx,
  specificDiscountCardTitleSx,
  specificDiscountTableContainerSx,
  specificDiscountTableHeaderCellSx,
  specificDiscountTableHeaderSx,
  specificDiscountTableRowSx,
  specificDiscountTableValueSx,
  specificDiscountTitleSx,
  specificDiscountWrapperSx,
} from '../styles';
import { getLocalizedText } from '../utils';
import DetailSectionCard from './detail-section-card';

function SpecificDiscountCard({
  title,
  rows,
}: {
  title: string;
  rows: { no_of_kids?: number; discount?: number }[];
}) {
  const { t } = useTranslate();

  if (!rows.length) return null;

  return (
    <Box sx={{ ...specificDiscountCardSx, ...specificDiscountTableContainerSx }}>
      <Typography sx={specificDiscountCardTitleSx}>{title}</Typography>

      <Box sx={specificDiscountTableHeaderSx}>
        <Typography sx={specificDiscountTableHeaderCellSx}>
          {t('ADD_PROGRAM.NO_OF_KIDS')}
        </Typography>
        <Typography sx={{ ...specificDiscountTableHeaderCellSx, textAlign: 'right' }}>
          {t('ADD_PROGRAM.DISCOUNT_PERCENT')}
        </Typography>
      </Box>

      {rows.map((row, index) => (
        <Box key={`${row.no_of_kids}-${index}`} sx={specificDiscountTableRowSx}>
          <Typography sx={specificDiscountTableValueSx}>
            {row.no_of_kids ?? '-'}
          </Typography>
          <Typography sx={{ ...specificDiscountTableValueSx, textAlign: 'right' }}>
            {row.discount != null ? `${row.discount}%` : '-'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

type Props = {
  course: any;
  isArabic: boolean;
};

export default function DiscountDetailsSection({ course, isArabic }: Props) {
  const { t } = useTranslate();

  const specificDiscounts = (course?.discount || []).filter(
    (group: any) => Array.isArray(group?.discounts) && group.discounts.length > 0
  );
  const hasTotalDiscount =
    String(course?.discount_type).toLowerCase() === 'total' &&
    Number(course?.discount_amount) > 0;

  if (!hasTotalDiscount && !specificDiscounts.length) return null;

  return (
    <DetailSectionCard title={t('PROGRAM_DETAILS.DISCOUNT_SECTION')}>
      {hasTotalDiscount && (
        <Box sx={{ mb: specificDiscounts.length > 0 ? 3 : 0 }}>
          <Typography sx={specificDiscountTitleSx}>{t('ADD_PROGRAM.TOTAL_DISCOUNT')}</Typography>
          <Box sx={discountValueBoxSx}>
            <Typography sx={detailValueSx}>{course.discount_amount}%</Typography>
          </Box>
        </Box>
      )}

      {specificDiscounts.length > 0 && (
        <Box>
          <Typography sx={specificDiscountTitleSx}>{t('ADD_PROGRAM.SPECIFIC_DISCOUNT')}</Typography>
          <Box sx={specificDiscountWrapperSx}>
            {specificDiscounts.map((group: any, index: number) => (
              <SpecificDiscountCard
                key={index}
                title={getLocalizedText(
                  isArabic,
                  group.title_ar,
                  group.title_en,
                  t('ADD_PROGRAM.SPECIFIC_DISCOUNT')
                )}
                rows={group.discounts || []}
              />
            ))}
          </Box>
        </Box>
      )}
    </DetailSectionCard>
  );
}
