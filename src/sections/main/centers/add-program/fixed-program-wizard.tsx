'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import FormProvider from 'src/components/hook-form';

import FormActions from './components/form-actions';
import ProgramStepper from './components/program-stepper';
import BookingTypeToggle from './components/booking-type-toggle';
import { getFixedProgramDefaultValues } from './default-values';
import StepAdditional from './steps/step-additional';
import StepDiscount from './steps/step-discount';
import StepProgram from './steps/step-program';
import StepSession from './steps/step-session';
import { programCardSx } from './styles';
import type { CategoryOption, FixedProgramFormValues, ProgramStep } from './types';
import { getStepSchema } from './validation';

type Props = {
  centerId: string;
  centerName: string;
  categories: CategoryOption[];
};

const STEP_FIELDS: Record<ProgramStep, (keyof FixedProgramFormValues)[]> = {
  0: ['courseImages', 'name_ar', 'name_en', 'price', 'field_id', 'start_date', 'end_date'],
  1: [
    'start_time',
    'end_time',
    'gender',
    'same_age_range',
    'boys_age_from',
    'boys_age_to',
    'girls_age_from',
    'girls_age_to',
    'seats',
  ],
  2: ['additional_questions', 'addOnMaterials'],
  3: ['enableDiscount', 'discount_type', 'discount_amount', 'discount'],
};

export default function FixedProgramWizard({ centerId, centerName, categories }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState<ProgramStep>(0);

  const defaultValues = useMemo(() => getFixedProgramDefaultValues(), []);

  const methods = useForm<FixedProgramFormValues>({
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, watch, setError, clearErrors, setValue } = methods;
  const bookingType = watch('bookingType');

  const pageTitle =
    activeStep === 0 && centerName ? centerName : t('ADD_PROGRAM.CREATE_PROGRAM');

  const validateCurrentStep = async () => {
    const schema = getStepSchema(activeStep);
    const values = methods.getValues();
    const stepValues = STEP_FIELDS[activeStep].reduce(
      (acc, key) => {
        acc[key] = values[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

    try {
      await schema.validate(stepValues, { abortEarly: false });
      clearErrors();
      return true;
    } catch (error: any) {
      if (error?.inner?.length) {
        error.inner.forEach((item: any) => {
          if (item.path) {
            const path = String(item.path).replace(/\[(\d+)\]/g, '.$1');
            setError(path as keyof FixedProgramFormValues, {
              type: 'manual',
              message: item.message,
            });
          }
        });
      }
      return false;
    }
  };

  const handleNext = async () => {
    if (bookingType === 'flexible') {
      enqueueSnackbar(t('ADD_PROGRAM.FLEXIBLE_COMING_SOON'), { variant: 'info' });
      return;
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (activeStep < 3) {
      setActiveStep((prev) => (prev + 1) as ProgramStep);
      return;
    }

    handleSubmit(onPublish)();
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => (prev - 1) as ProgramStep);
    }
  };

  const onPublish = (data: FixedProgramFormValues) => {
    // API integration will be added in a follow-up step.
    console.log('Publish fixed program', { centerId, data });
    enqueueSnackbar(t('ADD_PROGRAM.PUBLISH_PLACEHOLDER'), { variant: 'info' });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <BookingTypeToggle
              value={bookingType}
              onChange={(value) => setValue('bookingType', value)}
            />
            {bookingType === 'fixed' ? (
              <StepProgram categories={categories} />
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                {t('ADD_PROGRAM.FLEXIBLE_COMING_SOON')}
              </Typography>
            )}
          </>
        );
      case 1:
        return <StepSession />;
      case 2:
        return <StepAdditional />;
      case 3:
        return <StepDiscount />;
      default:
        return null;
    }
  };

  return (
    <FormProvider methods={methods}>
      <Typography variant="h4" sx={{ color: '#2C8B8E', fontWeight: 700, mb: 3 }}>
        {pageTitle}
      </Typography>

      <ProgramStepper activeStep={activeStep} />

      <Card sx={programCardSx}>{renderStep()}</Card>

      <FormActions
        showPrevious={activeStep > 0}
        onPrevious={handlePrevious}
        onNext={handleNext}
        nextLabel={activeStep === 3 ? t('ADD_PROGRAM.PUBLISH') : t('ADD_PROGRAM.NEXT')}
      />
    </FormProvider>
  );
}
