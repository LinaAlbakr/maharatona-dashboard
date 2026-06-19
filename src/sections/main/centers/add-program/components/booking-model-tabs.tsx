'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import {
  FIELD_LABEL_COLOR,
  FLEXIBLE_BOOKING_MODELS,
  FREE_BOOKING_COLOR,
  PROGRAM_SECTION_HEADING_COLOR,
} from '../constants';
import { programStepHeadingSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';

type Props = {
  activeModel: FlexibleBookingModelKey;
  onSelectTrial: () => void;
  onSelectMainModel: (model: FlexibleBookingModelKey) => void;
};

export default function BookingModelTabs({
  activeModel,
  onSelectTrial,
  onSelectMainModel,
}: Props) {
  const { t } = useTranslate();
  const { control } = useFormContext<ProgramFormValues>();
  const isTrialEnabled = useWatch({ control, name: 'flexibleModels.trial.enabled' }) === true;

  const mainModels = FLEXIBLE_BOOKING_MODELS.filter((m) => m.key !== 'trial');
  const trialModel = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === 'trial')!;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ ...programStepHeadingSx, mb: 0 }}>
          {t('ADD_PROGRAM.CHOOSE_BOOKING_MODEL')}
          <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
            *
          </Box>
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={onSelectTrial}
          style={{
            backgroundColor: isTrialEnabled ? FREE_BOOKING_COLOR : '#FFFFFF',
            color: isTrialEnabled ? '#FFFFFF' : FREE_BOOKING_COLOR,
            border: `1px solid ${FREE_BOOKING_COLOR}`,
          }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            width: 140,
            height: 32,
            px: 1.5,
            borderRadius: '20px',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'inherit',
            lineHeight: 1,
            cursor: 'pointer',
            outline: 'none',
            '&:hover': {
              backgroundColor: isTrialEnabled ? FREE_BOOKING_COLOR : '#FFFFFF',
              color: isTrialEnabled ? '#FFFFFF' : FREE_BOOKING_COLOR,
            },
          }}
        >
          <Iconify icon="mingcute:add-line" width={16} sx={{ color: 'inherit', flexShrink: 0 }} />
          {t(trialModel.labelKey)}
        </Box>
      </Box>

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
        }}
      >
        {mainModels.map((model) => {
          const selected = activeModel === model.key;

          return (
            <Box
              key={model.key}
              component="button"
              type="button"
              onClick={(e) => {
                (e.currentTarget as HTMLButtonElement).blur();
                onSelectMainModel(model.key);
              }}
              style={{
                backgroundColor: selected ? PROGRAM_SECTION_HEADING_COLOR : '#FFFFFF',
                color: selected ? '#FFFFFF' : FIELD_LABEL_COLOR,
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
                border: '2px solid transparent',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'inherit',
                lineHeight: 1,
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
                '&:focus': { outline: 'none' },
                '&:focus-visible': { outline: 'none' },
                '&:hover': {
                  backgroundColor: selected ? PROGRAM_SECTION_HEADING_COLOR : '#FFFFFF',
                  color: selected ? '#FFFFFF' : FIELD_LABEL_COLOR,
                },
              }}
            >
              {t(model.labelKey)}
            </Box>
          );
        })}
      </Box>

    </Box>
  );
}
