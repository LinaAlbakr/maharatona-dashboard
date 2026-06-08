'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import FormProvider from 'src/components/hook-form';

import FormActions from './components/form-actions';
import ProgramStepper from './components/program-stepper';
import BookingTypeToggle from './components/booking-type-toggle';
import { getProgramDefaultValues } from './default-values';
import StepAdditional from './steps/step-additional';
import StepDiscount from './steps/step-discount';
import StepFlexibleProgram from './steps/step-flexible-program';
import StepFlexibleSession from './steps/step-flexible-session';
import StepProgram from './steps/step-program';
import StepSession from './steps/step-session';
import { SKIP_PROGRAM_STEP_VALIDATION } from './constants';
import { programCardSx } from './styles';
import type { CategoryOption, ProgramFormValues, ProgramStep } from './types';
import { getStepSchema } from './validation';

type Props = {
  centerId: string;
  centerName: string;
  categories: CategoryOption[];
};

export default function ProgramWizard({ centerId, centerName, categories }: Props) {
  const { t } = useTranslate();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState<ProgramStep>(0);

  const defaultValues = useMemo(() => getProgramDefaultValues(), []);

  const methods = useForm<ProgramFormValues>({
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, watch, setError, clearErrors, setValue } = methods;
  const bookingType = watch('bookingType');

  const pageTitle = centerName
    ? `${t('LABEL.ADD_PROGRAM')} - ${centerName}`
    : t('LABEL.ADD_PROGRAM');

  const validateCurrentStep = async () => {
    const values = methods.getValues();
    const schema = getStepSchema(activeStep, bookingType, values.flexibleModels);

    try {
      await schema.validate(values, { abortEarly: false });
      clearErrors();
      return true;
    } catch (error: any) {
      if (error?.inner?.length) {
        error.inner.forEach((item: any) => {
          if (item.path) {
            const path = String(item.path).replace(/\[(\d+)\]/g, '.$1');
            setError(path as keyof ProgramFormValues, {
              type: 'manual',
              message: item.message,
            });
          }
        });
      } else if (error?.message) {
        enqueueSnackbar(t(String(error.message)), { variant: 'error' });
      }
      return false;
    }
  };

  const handleNext = async () => {
    if (!SKIP_PROGRAM_STEP_VALIDATION) {
      const isValid = await validateCurrentStep();
      if (!isValid) return;
    } else {
      clearErrors();
    }

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

  const onPublish = (data: ProgramFormValues) => {
    console.log('Publish program', { centerId, data });
    enqueueSnackbar(t('ADD_PROGRAM.PUBLISH_PLACEHOLDER'), { variant: 'info' });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return bookingType === 'fixed' ? (
          <StepProgram categories={categories} />
        ) : (
          <StepFlexibleProgram categories={categories} />
        );
      case 1:
        return bookingType === 'fixed' ? <StepSession /> : <StepFlexibleSession />;
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
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
          color: '#2C8B8E',
          mb: 2,
          lineHeight: 1.3,
        }}
      >
        {pageTitle}
      </Typography>

      <Card
        sx={{
          ...programCardSx,
          height: 90,
          display: 'flex',
          alignItems: 'center',
          p: 0,
          px: { xs: 2, md: 2.5 },
          mb: 3,
          width: '100%',
        }}
      >
        <ProgramStepper activeStep={activeStep} />
      </Card>

      {activeStep === 0 ? (
        <BookingTypeToggle
          value={bookingType}
          onChange={(value) => setValue('bookingType', value)}
        />
      ) : null}

      {activeStep === 2 ? (
        <Box>{renderStep()}</Box>
      ) : (
        <Card sx={programCardSx}>{renderStep()}</Card>
      )}

      <FormActions
        showPrevious={activeStep > 0}
        onPrevious={handlePrevious}
        onNext={handleNext}
        nextLabel={activeStep === 3 ? t('ADD_PROGRAM.PUBLISH') : t('ADD_PROGRAM.NEXT')}
      />
    </FormProvider>
  );
}
