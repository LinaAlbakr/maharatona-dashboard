'use client';

import Box from '@mui/material/Box';

import { RiyalIcon } from 'src/sections/main/centers/add-program/components/course-icons';

import { priceValueSx } from '../styles';

type Props = {
  amount: number | string | null | undefined;
};

export default function PriceValue({ amount }: Props) {
  if (amount === null || amount === undefined || amount === '') return <>-</>;

  return (
    <Box sx={priceValueSx}>
      <RiyalIcon />
      <Box component="span">{Math.floor(Number(amount))}</Box>
    </Box>
  );
}
