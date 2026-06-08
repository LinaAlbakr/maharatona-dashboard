'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { FIELD_BORDER_COLOR, FIELD_LABEL_COLOR, PROGRAM_SECTION_HEADING_COLOR } from '../constants';
import { programStepHeadingSx } from '../styles';
import type { TimeSlotType } from '../types';

type Props = {
  value: TimeSlotType;
  onChange: (value: TimeSlotType) => void;
};

export default function TimeTypeSelector({ value, onChange }: Props) {
  const { t } = useTranslate();

  const options: { value: TimeSlotType; titleKey: string; descKey: string }[] = [
    {
      value: 'open',
      titleKey: 'ADD_PROGRAM.OPEN_TIME_RANGE',
      descKey: 'ADD_PROGRAM.OPEN_TIME_RANGE_DESC',
    },
    {
      value: 'fixed',
      titleKey: 'ADD_PROGRAM.FIXED_TIME_SLOTS',
      descKey: 'ADD_PROGRAM.FIXED_TIME_SLOTS_DESC',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={programStepHeadingSx}>{t('ADD_PROGRAM.SELECT_TIME')}</Typography>

      <Card
        sx={{
          height: 77,
          borderRadius: '16px',
          boxShadow: '0px 4px 24px rgba(145, 158, 171, 0.12)',
          px: 2,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', lg: 'center' },
            gap: 2,
            height: 77,
            width: '100%',
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Box
              key={option.value}
              component="button"
              type="button"
              onClick={() => onChange(option.value)}
              sx={{
                width: { xs: '100%', md: 505 },
                maxWidth: 505,
                height: 77,
                flex: { xs: 1, md: '0 0 505px' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: selected ? PROGRAM_SECTION_HEADING_COLOR : FIELD_BORDER_COLOR,
                bgcolor: selected ? 'rgba(60, 184, 187, 0.08)' : 'common.white',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'inherit',
                textAlign: 'center',
                '&:hover': {
                  borderColor: PROGRAM_SECTION_HEADING_COLOR,
                },
              }}
            >
              <Radio
                checked={selected}
                tabIndex={-1}
                disableRipple
                sx={{
                  p: 0,
                  flexShrink: 0,
                  color: PROGRAM_SECTION_HEADING_COLOR,
                  '&.Mui-checked': { color: PROGRAM_SECTION_HEADING_COLOR },
                }}
              />
              <Box sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: PROGRAM_SECTION_HEADING_COLOR,
                    lineHeight: 1.3,
                  }}
                >
                  {t(option.titleKey)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: FIELD_LABEL_COLOR,
                    lineHeight: 1.4,
                    mt: 0.25,
                  }}
                >
                  {t(option.descKey)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        </Box>
      </Card>
    </Box>
  );
}
