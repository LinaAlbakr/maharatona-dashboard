'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import Iconify from 'src/components/iconify';

import { PROGRAM_STEPS, PROGRAM_TEAL } from '../constants';
import type { ProgramStep } from '../types';

const STEP_LABEL_COLOR = '#2B509C';
const STEP_ICON_SIZE = 36;

type Props = {
  activeStep: ProgramStep;
};

export default function ProgramStepper({ activeStep }: Props) {
  const { t } = useTranslate();
  const lastIndex = PROGRAM_STEPS.length - 1;

  return (
    <Box sx={{ width: '100%', position: 'relative', pt: 0.5 }}>
      <Box
        sx={{
          position: 'absolute',
          top: STEP_ICON_SIZE / 2,
          left: STEP_ICON_SIZE / 2,
          right: STEP_ICON_SIZE / 2,
          borderTop: '2px dashed',
          borderColor: 'transparent',
          borderImage:
            'repeating-linear-gradient(to right, #C4CDD5 0, #C4CDD5 6px, transparent 6px, transparent 12px) 1',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {PROGRAM_STEPS.map((step, index) => {
          const completed = step.key < activeStep;
          const active = step.key === activeStep;
          const isFirst = index === 0;
          const isLast = index === lastIndex;

          return (
            <Box
              key={step.key}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center',
              }}
            >
              <Box
                sx={{
                  width: STEP_ICON_SIZE,
                  height: STEP_ICON_SIZE,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: completed || active ? PROGRAM_TEAL : 'common.white',
                  border: completed || active ? 'none' : '2px solid',
                  borderColor: 'grey.300',
                  color: completed || active ? 'common.white' : 'text.secondary',
                }}
              >
                {completed ? (
                  <Iconify icon="eva:checkmark-fill" width={20} />
                ) : (
                  <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
                    {step.key + 1}
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 12,
                  fontWeight: active || completed ? 700 : 500,
                  color: STEP_LABEL_COLOR,
                  lineHeight: 1.4,
                  textAlign: isFirst ? 'left' : isLast ? 'right' : 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(step.labelKey)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
