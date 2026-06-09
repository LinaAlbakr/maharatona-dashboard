'use client';

import Box from '@mui/material/Box';

import { useTranslate } from 'src/locales';

import {
  FIELD_LABEL_COLOR,
  PROGRAM_SECTION_HEADING_COLOR,
} from 'src/sections/main/centers/add-program/constants';
import type { FlexibleBookingModelKey } from 'src/sections/main/centers/add-program/types';

import { FLEXIBLE_TAB_MODELS } from '../flexible-utils';

const EMPTY_TAB_COLOR = '#BABABA';

type Props = {
  activeModel: FlexibleBookingModelKey;
  filledModels: FlexibleBookingModelKey[];
  onChange: (model: FlexibleBookingModelKey) => void;
};

export default function BookingModelTabsReadonly({
  activeModel,
  filledModels,
  onChange,
}: Props) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: 52,
        px: 1.5,
        borderRadius: '26px',
        bgcolor: 'grey.100',
        gap: 1,
        overflowX: 'auto',
        mb: 3,
      }}
    >
      {FLEXIBLE_TAB_MODELS.map((model) => {
        const hasData = filledModels.includes(model.key);
        const selected = activeModel === model.key;

        return (
          <Box
            key={model.key}
            component="button"
            type="button"
            disabled={!hasData}
            onClick={() => {
              if (hasData) onChange(model.key);
            }}
            style={{
              backgroundColor: !hasData
                ? '#E8E8E8'
                : selected
                  ? PROGRAM_SECTION_HEADING_COLOR
                  : '#FFFFFF',
              color: !hasData ? EMPTY_TAB_COLOR : selected ? '#FFFFFF' : FIELD_LABEL_COLOR,
            }}
            sx={{
              flexShrink: 0,
              width: 140,
              minWidth: 140,
              height: 30,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '15px',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'inherit',
              lineHeight: 1,
              cursor: hasData ? 'pointer' : 'not-allowed',
              opacity: hasData ? 1 : 0.85,
            }}
          >
            {t(model.labelKey)}
          </Box>
        );
      })}
    </Box>
  );
}
