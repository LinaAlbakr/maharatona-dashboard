'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import BookingModelTabs from '../components/booking-model-tabs';
import FlexibleModelSessionContent from '../components/flexible-model-session-content';
import { FIELD_LABEL_COLOR, PROGRAM_SECTION_HEADING_COLOR } from '../constants';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';
import {
  hasFlexibleMainModelData,
  hasFlexibleTrialSlotData,
} from '../utils/flexible-model-config';

export default function StepFlexibleSession() {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProgramFormValues>();
  const flexibleModels = watch('flexibleModels');

  const [activeModel, setActiveModel] = useState<FlexibleBookingModelKey>('minutes');

  const showTrialCombineError = useCallback(() => {
    enqueueSnackbar(t('ADD_PROGRAM.TRIAL_CANNOT_COMBINE'), { variant: 'error' });
  }, [enqueueSnackbar, t]);

  const updateFlexibleModels = useCallback(
    (next: ProgramFormValues['flexibleModels']) => {
      setValue('flexibleModels', next, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const handleSelectTrial = useCallback(() => {
    if (hasFlexibleMainModelData(flexibleModels)) {
      showTrialCombineError();
      return;
    }

    const next = { ...flexibleModels };
    (Object.keys(next) as FlexibleBookingModelKey[]).forEach((key) => {
      next[key] = { ...next[key], enabled: key === 'trial' };
    });
    updateFlexibleModels(next);
    setActiveModel('trial');
  }, [flexibleModels, showTrialCombineError, updateFlexibleModels]);

  const handleSelectMainModel = useCallback(
    (modelKey: FlexibleBookingModelKey) => {
      if (hasFlexibleTrialSlotData(flexibleModels.trial)) {
        showTrialCombineError();
        return;
      }

      const next = { ...flexibleModels };
      next.trial = { ...next.trial, enabled: false };
      updateFlexibleModels(next);
      setActiveModel(modelKey);
    },
    [flexibleModels, showTrialCombineError, updateFlexibleModels]
  );

  useEffect(() => {
    const modelErrors = errors.flexibleModels;
    if (!modelErrors || typeof modelErrors !== 'object') return;

    const modelWithError = (Object.keys(flexibleModels) as FlexibleBookingModelKey[]).find(
      (key) => Boolean((modelErrors as Record<string, unknown>)[key])
    );

    if (modelWithError && modelWithError !== activeModel) {
      setActiveModel(modelWithError);
    }
  }, [errors.flexibleModels, flexibleModels, activeModel]);

  return (
    <Box>
      <BookingModelTabs
        activeModel={activeModel}
        onSelectTrial={handleSelectTrial}
        onSelectMainModel={handleSelectMainModel}
      />

      <FlexibleModelSessionContent key={activeModel} modelKey={activeModel} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
        <Iconify
          icon="eva:info-outline"
          width={18}
          sx={{ color: PROGRAM_SECTION_HEADING_COLOR, flexShrink: 0 }}
        />
        <Typography sx={{ fontSize: 16, color: FIELD_LABEL_COLOR, lineHeight: 1.4 }}>
          {t('ADD_PROGRAM.MULTI_MODEL_HINT')}
        </Typography>
      </Box>
    </Box>
  );
}
