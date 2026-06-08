'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import BookingModelTabs from '../components/booking-model-tabs';
import FlexiblePackagesSection from '../components/flexible-packages-section';
import FlexibleSlotCard from '../components/flexible-slot-card';
import TimeTypeSelector from '../components/time-type-selector';
import {
  EMPTY_FLEXIBLE_SLOT,
  FIELD_LABEL_COLOR,
  FLEXIBLE_BOOKING_MODELS,
  PROGRAM_SECTION_HEADING_COLOR,
} from '../constants';
import { dashedAddButtonSx, programStepHeadingSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';

const MAIN_MODEL_KEYS = FLEXIBLE_BOOKING_MODELS.filter((m) => m.key !== 'trial').map(
  (m) => m.key
);

export default function StepFlexibleSession() {
  const { t } = useTranslate();
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProgramFormValues>();
  const flexibleModels = watch('flexibleModels');

  const enabledModels = useMemo(
    () =>
      (Object.keys(flexibleModels) as FlexibleBookingModelKey[]).filter(
        (key) => flexibleModels[key]?.enabled
      ),
    [flexibleModels]
  );

  const [activeModel, setActiveModel] = useState<FlexibleBookingModelKey>('trial');

  const updateFlexibleModels = useCallback(
    (next: ProgramFormValues['flexibleModels']) => {
      setValue('flexibleModels', next, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const handleSelectTrial = useCallback(() => {
    const next = { ...flexibleModels };
    (Object.keys(next) as FlexibleBookingModelKey[]).forEach((key) => {
      next[key] = { ...next[key], enabled: key === 'trial' };
    });
    updateFlexibleModels(next);
    setActiveModel('trial');
  }, [flexibleModels, updateFlexibleModels]);

  const handleSelectMainModel = useCallback(
    (modelKey: FlexibleBookingModelKey) => {
      const isActive = activeModel === modelKey && flexibleModels[modelKey]?.enabled;

      if (isActive) {
        handleSelectTrial();
        return;
      }

      const next = { ...flexibleModels };
      MAIN_MODEL_KEYS.forEach((key) => {
        next[key] = { ...next[key], enabled: key === modelKey };
      });
      next.trial = { ...next.trial, enabled: false };
      updateFlexibleModels(next);
      setActiveModel(modelKey);
    },
    [activeModel, flexibleModels, handleSelectTrial, updateFlexibleModels]
  );

  useEffect(() => {
    if (enabledModels.length === 0) {
      handleSelectTrial();
    }
  }, [enabledModels.length, handleSelectTrial]);

  useEffect(() => {
    if (!enabledModels.includes(activeModel)) {
      setActiveModel(enabledModels[0] || 'trial');
    }
  }, [enabledModels, activeModel]);

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

  const currentModel = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === activeModel)!;
  const timeType = flexibleModels[activeModel]?.timeType || 'open';

  const { fields, append, remove } = useFieldArray({
    control,
    name: `flexibleModels.${activeModel}.slots`,
  });

  return (
    <Box>
      <BookingModelTabs
        activeModel={activeModel}
        enabledModels={enabledModels}
        onSelectTrial={handleSelectTrial}
        onSelectMainModel={handleSelectMainModel}
      />

      {enabledModels.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          {t('ADD_PROGRAM.SELECT_AT_LEAST_ONE_MODEL')}
        </Typography>
      ) : (
        <Box key={activeModel}>
          {currentModel.hasTimeType ? (
            <TimeTypeSelector
              value={timeType}
              onChange={(value) => setValue(`flexibleModels.${activeModel}.timeType`, value)}
            />
          ) : null}

          {currentModel.hasPackages ? (
            <FlexiblePackagesSection modelKey={activeModel} />
          ) : null}

          <Typography sx={programStepHeadingSx}>{t('ADD_PROGRAM.CREATE_SLOTS')}</Typography>

          {fields.map((field, index) => (
            <FlexibleSlotCard
              key={field.id}
              modelKey={activeModel}
              slotIndex={index}
              timeType={timeType}
              onRemove={fields.length > 1 ? () => remove(index) : undefined}
            />
          ))}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => append({ ...EMPTY_FLEXIBLE_SLOT })}
            sx={dashedAddButtonSx}
          >
            {t('ADD_PROGRAM.ADD_MORE_SLOTS')}
          </Button>
        </Box>
      )}

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
