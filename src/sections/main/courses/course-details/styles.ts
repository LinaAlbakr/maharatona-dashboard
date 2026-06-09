import {
  FREE_BOOKING_COLOR,
  PROGRAM_TEAL,
  PROGRAM_TEAL_DARK,
} from 'src/sections/main/centers/add-program/constants';

export const detailCardSx = {
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0px 4px 24px rgba(145, 158, 171, 0.12)',
  p: { xs: 2.5, md: 4 },
  mb: 2.5,
};

export const detailSectionTitleSx = {
  color: '#3CB8BB',
  fontWeight: 700,
  fontSize: 24,
  mb: 1.5,
  lineHeight: 1.3,
};

export const detailSubsectionTitleSx = {
  color: FREE_BOOKING_COLOR,
  fontWeight: 700,
  fontSize: 18,
  mb: 2,
  lineHeight: 1.3,
};

export const questionsSubsectionTitleSx = {
  color: '#DE0E75',
  fontWeight: 400,
  fontSize: 18,
  mb: 2,
  lineHeight: 1.3,
};

export const addonsMaterialsSubsectionTitleSx = {
  color: FREE_BOOKING_COLOR,
  fontWeight: 400,
  fontSize: 18,
  mb: 2,
  lineHeight: 1.3,
};

export const questionNumberBadgeSx = {
  width: 21,
  height: 21,
  borderRadius: '50%',
  bgcolor: PROGRAM_TEAL,
  color: 'common.white',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 12,
  flexShrink: 0,
  lineHeight: 1,
};

export const questionCheckboxSx = {
  color: '#3CB8BB',
  p: 0.5,
  '&.Mui-checked': {
    color: '#3CB8BB',
  },
  '&.Mui-disabled': {
    color: '#3CB8BB',
  },
  '&.Mui-checked.Mui-disabled': {
    color: '#3CB8BB',
  },
};

export const questionCheckboxLabelSx = {
  m: 0,
  ml: 0.5,
  mr: 0,
  gap: 0.5,
  '& .MuiFormControlLabel-label': {
    color: '#2B509C',
    fontSize: 14,
    fontWeight: 500,
  },
  '& .MuiFormControlLabel-label.Mui-disabled': {
    color: '#2B509C',
  },
};

export const detailLabelSx = {
  color: '#2B509C',
  fontWeight: 600,
  fontSize: 16,
  mb: 0.5,
  lineHeight: 1.4,
};

export const detailValueSx = {
  color: '#767676',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.6,
};

export const editProgramButtonSx = {
  borderRadius: '40px',
  py: 1.25,
  px: 4,
  fontWeight: 600,
  fontSize: '1rem',
  borderColor: PROGRAM_TEAL,
  color: PROGRAM_TEAL,
  bgcolor: 'common.white',
  '&:hover': {
    borderColor: PROGRAM_TEAL_DARK,
    bgcolor: 'common.white',
    color: PROGRAM_TEAL_DARK,
  },
};

export const discountValueBoxSx = {
  border: '1px solid',
  borderColor: 'grey.300',
  borderRadius: '12px',
  px: 2.5,
  py: 1.5,
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 80,
};

export const specificDiscountTitleSx = {
  color: '#DE0E75',
  fontWeight: 400,
  fontSize: 18,
  mb: 2,
  lineHeight: 1.3,
};

export const specificDiscountWrapperSx = {
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0px 4px 24px rgba(145, 158, 171, 0.12)',
  p: { xs: 2, md: 3 },
};

export const specificDiscountCardSx = {
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0px 4px 24px rgba(145, 158, 171, 0.12)',
  p: { xs: 2, md: 2.5 },
  height: '100%',
};

export const specificDiscountCardTitleSx = {
  color: '#2B509C',
  fontWeight: 400,
  fontSize: 16,
  mb: 2,
  lineHeight: 1.4,
};

export const specificDiscountTableHeaderSx = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  pb: 1.25,
};

export const specificDiscountTableHeaderCellSx = {
  color: '#2B509C',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: 1.4,
};

export const specificDiscountTableRowSx = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  py: 1.25,
  borderTop: '1px solid',
  borderColor: 'grey.200',
};
