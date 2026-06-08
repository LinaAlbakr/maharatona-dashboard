'use client';

import { useMemo, useState } from 'react';
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
  FLEXIBLE_BOOKING_MODELS,
  PROGRAM_TEAL,
} from '../constants';
import { dashedAddButtonSx, programSectionTitleSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';

export default function StepFlexibleSession() {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();
  const flexibleModels = watch('flexibleModels');

  const enabledModels = useMemo(
    () =>
      (Object.keys(flexibleModels) as FlexibleBookingModelKey[]).filter(
        (key) => flexibleModels[key]?.enabled
      ),
    [flexibleModels]
  );

  const [activeModel, setActiveModel] = useState<FlexibleBookingModelKey>(
    enabledModels[0] || 'minutes'
  );

  const currentModel = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === activeModel)!;
  const timeType = flexibleModels[activeModel]?.timeType || 'open';

  const { fields, append, remove } = useFieldArray({
    control,
    name: `flexibleModels.${activeModel}.slots`,
  });

  const handleToggleModel = (modelKey: FlexibleBookingModelKey) => {
    const isEnabled = flexibleModels[modelKey]?.enabled;
    setValue(`flexibleModels.${modelKey}.enabled`, !isEnabled);
    if (!isEnabled) {
      setActiveModel(modelKey);
    }
  };

  return (
    <Box>
      <BookingModelTabs
        activeModel={activeModel}
        enabledModels={enabledModels}
        onActiveChange={setActiveModel}
        onToggleModel={handleToggleModel}
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

          <Typography sx={programSectionTitleSx}>{t('ADD_PROGRAM.CREATE_SLOTS')}</Typography>

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
        <Iconify icon="eva:info-outline" width={18} sx={{ color: PROGRAM_TEAL }} />
        <Typography variant="body2" color="text.secondary">
          {t('ADD_PROGRAM.MULTI_MODEL_HINT')}
        </Typography>
      </Box>
    </Box>
  );
}
