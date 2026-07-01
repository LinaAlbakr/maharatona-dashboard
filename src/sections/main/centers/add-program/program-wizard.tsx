'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import { revalidateAfterCourseCreate } from 'src/actions/courses';

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
import { mapCourseToProgramFormValues } from './utils/map-course-to-form-values';
import { getStepSchema } from './validation';

type Props = {
  mode?: 'create' | 'edit';
  courseId?: string;
  centerId: string;
  centerName: string;
  categories: CategoryOption[];
  initialCourse?: Record<string, unknown>;
};

export default function ProgramWizard({
  mode = 'create',
  courseId,
  centerId,
  centerName,
  categories,
  initialCourse,
}: Props) {
  const { t } = useTranslate();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState<ProgramStep>(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);

  const defaultValues = useMemo(
    () => (initialCourse ? mapCourseToProgramFormValues(initialCourse) : getProgramDefaultValues()),
    [initialCourse]
  );
  const isEditMode = mode === 'edit';

  const methods = useForm<ProgramFormValues>({
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, watch, setError, clearErrors, setValue, reset } = methods;

  useEffect(() => {
    if (!initialCourse) return;
    reset(mapCourseToProgramFormValues(initialCourse));
  }, [initialCourse, reset]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      wizardTopRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [activeStep]);

  const bookingType = watch('bookingType');

  const handleBookingTypeChange = (next: ProgramFormValues['bookingType']) => {
    if (next === bookingType) return;
    setValue('bookingType', next, { shouldDirty: true });
    clearErrors();
  };

  const pageTitle = centerName
    ? `${t(isEditMode ? 'ADD_PROGRAM.EDIT_PROGRAM' : 'LABEL.ADD_PROGRAM')} - ${centerName}`
    : t(isEditMode ? 'ADD_PROGRAM.EDIT_PROGRAM' : 'LABEL.ADD_PROGRAM');

  const validateCurrentStep = async () => {
    const values = methods.getValues();
    const schema = getStepSchema(activeStep, bookingType, values.flexibleModels);

    try {
      await schema.validate(values, { abortEarly: false });
      clearErrors();
      return true;
    } catch (error: any) {
      let firstPath: string | undefined;

      const validationErrors = error?.inner?.length
        ? error.inner
        : error?.path
          ? [error]
          : [];

      if (
        validationErrors.some(
          (item: any) => item.message === 'ADD_PROGRAM.TRIAL_CANNOT_COMBINE'
        ) ||
        error?.message === 'ADD_PROGRAM.TRIAL_CANNOT_COMBINE'
      ) {
        enqueueSnackbar(t('ADD_PROGRAM.TRIAL_CANNOT_COMBINE'), { variant: 'error' });
      }

      if (
        validationErrors.some(
          (item: any) => item.message === 'ADD_PROGRAM.errorAddAtLeastOneSlot'
        ) ||
        error?.message === 'ADD_PROGRAM.errorAddAtLeastOneSlot'
      ) {
        enqueueSnackbar(t('ADD_PROGRAM.errorAddAtLeastOneSlot'), { variant: 'error' });
      }

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
      const result = await submitProgram(centerId, data, {
        mode: isEditMode ? 'edit' : 'create',
        courseId,
      });

      if (!result.success) {
        enqueueSnackbar(result.error, { variant: 'error' });
        return;
      }

      const savedCourseId = result.courseId ?? courseId;

      if (!savedCourseId) {
        enqueueSnackbar(
          t(isEditMode ? 'ADD_PROGRAM.UPDATE_SUCCESS' : 'ADD_PROGRAM.PUBLISH_SUCCESS'),
          { variant: 'success' }
        );
        await revalidateAfterCourseCreate(undefined, centerId);
        router.push(paths.dashboard.courses);
        router.refresh();
        return;
      }

      await revalidateAfterCourseCreate(savedCourseId, centerId);

      enqueueSnackbar(
        t(isEditMode ? 'ADD_PROGRAM.UPDATE_SUCCESS' : 'ADD_PROGRAM.PUBLISH_SUCCESS'),
        { variant: 'success' }
      );
      router.push(paths.dashboard.courseDetails(savedCourseId));
      router.refresh();
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
        ref={wizardTopRef}
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
        <BookingTypeToggle value={bookingType} onChange={handleBookingTypeChange} />
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
        nextLabel={
          activeStep === 3
            ? t(isEditMode ? 'ADD_PROGRAM.UPDATE' : 'ADD_PROGRAM.PUBLISH')
            : t('ADD_PROGRAM.NEXT')
        }
        isSubmitting={isPublishing}
      />
    </FormProvider>
  );
}
