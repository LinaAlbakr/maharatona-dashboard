'use client';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { styled } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { PROGRAM_STEPS, PROGRAM_TEAL } from '../constants';
import type { ProgramStep } from '../types';

const DashedConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 2,
    borderColor: 'transparent',
    borderTopStyle: 'dashed',
    borderImage: 'repeating-linear-gradient(to right, #C4CDD5 0, #C4CDD5 6px, transparent 6px, transparent 12px) 1',
  },
}));

type Props = {
  activeStep: ProgramStep;
};

export default function ProgramStepper({ activeStep }: Props) {
  const { t } = useTranslate();

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      connector={<DashedConnector />}
      sx={{ mb: 4, px: { xs: 0, md: 6 } }}
    >
      {PROGRAM_STEPS.map((step) => {
        const completed = step.key < activeStep;
        const active = step.key === activeStep;

        return (
          <Step key={step.key} completed={completed}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: completed || active ? PROGRAM_TEAL : 'common.white',
                    border: completed || active ? 'none' : '2px solid',
                    borderColor: 'grey.300',
                    color: completed || active ? 'common.white' : 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {completed ? (
                    <Iconify icon="eva:checkmark-fill" width={20} />
                  ) : (
                    <Typography variant="body2" fontWeight={700}>
                      {step.key + 1}
                    </Typography>
                  )}
                </Box>
              )}
            >
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontWeight: active ? 600 : 400,
                  color: active || completed ? PROGRAM_TEAL : 'text.secondary',
                }}
              >
                {t(step.labelKey)}
              </Typography>
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}
