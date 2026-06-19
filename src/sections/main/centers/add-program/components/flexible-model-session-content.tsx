'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import FlexiblePackagesSection from './flexible-packages-section';
import FlexibleSlotCard from './flexible-slot-card';
import TimeTypeSelector from './time-type-selector';
import { EMPTY_FLEXIBLE_SLOT, FLEXIBLE_BOOKING_MODELS } from '../constants';
import { dashedAddButtonSx, programStepHeadingSx } from '../styles';
import type { FlexibleBookingModelKey, ProgramFormValues } from '../types';

type Props = {
  modelKey: FlexibleBookingModelKey;
};

export default function FlexibleModelSessionContent({ modelKey }: Props) {
  const { t } = useTranslate();
  const { control, watch, setValue } = useFormContext<ProgramFormValues>();

  const currentModel = FLEXIBLE_BOOKING_MODELS.find((m) => m.key === modelKey)!;
  const timeType = watch(`flexibleModels.${modelKey}.timeType`) || 'open';

  const { fields, append, remove } = useFieldArray({
    control,
    name: `flexibleModels.${modelKey}.slots`,
  });

  return (
    <Box>
      {currentModel.hasTimeType ? (
        <TimeTypeSelector
          value={timeType}
          onChange={(value) => setValue(`flexibleModels.${modelKey}.timeType`, value)}
        />
      ) : null}

      {currentModel.hasPackages ? (
        <FlexiblePackagesSection key={`${modelKey}-packages`} modelKey={modelKey} />
      ) : null}

      <Typography sx={programStepHeadingSx}>{t('ADD_PROGRAM.CREATE_SLOTS')}</Typography>

      {fields.map((field, index) => (
        <FlexibleSlotCard
          key={field.id}
          modelKey={modelKey}
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
  );
}
