'use client';

import Box from '@mui/material/Box';

import { RiyalIcon } from 'src/sections/main/centers/add-program/components/course-icons';

import {
  discountedPriceBadgeSx,
  originalPriceStrikethroughSx,
  priceValueSx,
  priceWithDiscountRowSx,
} from '../styles';
import { formatPriceDisplay, getDiscountedAmount } from '../utils';

type Props = {
  amount: number | string | null | undefined;
  course?: any;
  discountedAmount?: number | null;
};

export default function PriceWithDiscountValue({ amount, course, discountedAmount }: Props) {
  if (amount === null || amount === undefined || amount === '') return <>-</>;

  const basePrice = Number(amount);
  if (!Number.isFinite(basePrice)) return <>-</>;

  const resolvedDiscount =
    discountedAmount !== undefined ? discountedAmount : getDiscountedAmount(basePrice, course);

  if (resolvedDiscount == null || resolvedDiscount >= basePrice) {
    return (
      <Box sx={priceValueSx}>
        <RiyalIcon />
        <Box component="span">{formatPriceDisplay(basePrice)}</Box>
      </Box>
    );
  }

  return (
    <Box sx={priceWithDiscountRowSx}>
      <Box sx={originalPriceStrikethroughSx}>
        <RiyalIcon />
        <Box component="span">{formatPriceDisplay(basePrice)}</Box>
      </Box>
      <Box sx={discountedPriceBadgeSx}>
        <RiyalIcon sx={{ filter: 'brightness(0) invert(1)' }} />
        <Box component="span">{formatPriceDisplay(resolvedDiscount)}</Box>
      </Box>
    </Box>
  );
}
