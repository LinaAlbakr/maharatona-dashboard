'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
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
import { submitProgram } from './utils/submit-program';
import { getStepSchema } from './validation';

type Props = {
  centerId: string;
  centerName: string;
  categories: CategoryOption[];
};

export default function ProgramWizard({ centerId, centerName, categories }: Props) {
  const { t } = useTranslate();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState<ProgramStep>(0);
  const [isPublishing, setIsPublishing] = useState(false);

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
      let firstPath: string | undefined;

      if (error?.inner?.length) {
        error.inner.forEach((item: any, index: number) => {
          if (item.path) {
            const path = String(item.path).replace(/\[(\d+)\]/g, '.$1');
            if (index === 0) firstPath = path;
            setError(path as keyof ProgramFormValues, {
              type: 'manual',
              message: item.message,
            });
          }
        });
      } else if (error?.path) {
        firstPath = String(error.path).replace(/\[(\d+)\]/g, '.$1');
        setError(firstPath as keyof ProgramFormValues, {
          type: 'manual',
          message: error.message,
        });
      }

      if (firstPath) {
        requestAnimationFrame(() => {
          const field =
            document.querySelector<HTMLElement>(`[name="${firstPath}"]`) ||
            document.querySelector<HTMLElement>(`[data-field="${firstPath}"]`);
          field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          field?.focus?.();
        });
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

  const onPublish = async (data: ProgramFormValues) => {
    setIsPublishing(true);
    try {
      const result = await submitProgram(centerId, data);

      if (!result.success) {
        enqueueSnackbar(result.error, { variant: 'error' });
        return;
      }

      enqueueSnackbar(
        result.message || t('ADD_PROGRAM.PUBLISH_SUCCESS'),
        { variant: 'success' }
      );
      router.push(`${paths.dashboard.centers}/${centerId}`);
    } finally {
      setIsPublishing(false);
    }
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

      {activeStep === 2 || activeStep === 3 ? (
        <Box>{renderStep()}</Box>
      ) : (
        <Card sx={programCardSx}>{renderStep()}</Card>
      )}

      <FormActions
        showPrevious={activeStep > 0}
        onPrevious={handlePrevious}
        onNext={handleNext}
        nextLabel={activeStep === 3 ? t('ADD_PROGRAM.PUBLISH') : t('ADD_PROGRAM.NEXT')}
        isSubmitting={isPublishing}
      />
    </FormProvider>
  );
}
