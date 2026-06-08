'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import RequiredLabel from './required-label';
import { FLEXIBLE_BOOKING_MODELS, PROGRAM_TEAL } from '../constants';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';

type Props = {
  activeModel: FlexibleBookingModelKey;
  enabledModels: FlexibleBookingModelKey[];
  onActiveChange: (model: FlexibleBookingModelKey) => void;
  onToggleModel: (model: FlexibleBookingModelKey) => void;
};

export default function BookingModelTabs({
  activeModel,
  enabledModels,
  onActiveChange,
  onToggleModel,
}: Props) {
  const { t } = useTranslate();

  const mainModels = FLEXIBLE_BOOKING_MODELS.filter((m) => m.key !== 'trial');
  const trialModel = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === 'trial')!;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <RequiredLabel required>{t('ADD_PROGRAM.CHOOSE_BOOKING_MODEL')}</RequiredLabel>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            onToggleModel('trial');
            onActiveChange('trial');
          }}
          sx={{
            borderRadius: '20px',
            borderColor: 'primary.main',
            color: 'primary.main',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          {t(trialModel.labelKey)}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
        {mainModels.map((model, index) => {
          const enabled = enabledModels.includes(model.key);
          const active = activeModel === model.key;

          return (
            <Button
              key={model.key}
              onClick={() => {
                if (!enabled) onToggleModel(model.key);
                onActiveChange(model.key);
              }}
              sx={{
                flex: 1,
                minWidth: 80,
                py: 1.25,
                borderRadius:
                  index === 0
                    ? '8px 0 0 8px'
                    : index === mainModels.length - 1
                      ? '0 8px 8px 0'
                      : 0,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: active ? PROGRAM_TEAL : 'common.white',
                color: active ? 'common.white' : 'text.secondary',
                border: '1px solid',
                borderColor: active ? PROGRAM_TEAL : 'grey.300',
                borderLeft: index > 0 ? 'none' : undefined,
                '&:hover': {
                  bgcolor: active ? PROGRAM_TEAL : 'grey.50',
                },
              }}
            >
              {t(model.labelKey)}
            </Button>
          );
        })}
      </Box>

      {enabledModels.includes('trial') ? (
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: PROGRAM_TEAL }}>
          {t('ADD_PROGRAM.TRIAL_ENABLED')}
        </Typography>
      ) : null}
    </Box>
  );
}
