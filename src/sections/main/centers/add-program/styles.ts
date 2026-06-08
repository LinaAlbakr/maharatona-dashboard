import {
  FIELD_BORDER_COLOR,
  FIELD_LABEL_COLOR,
  FIELD_PLACEHOLDER_COLOR,
  PROGRAM_TEAL,
  PROGRAM_TEAL_DARK,
} from './constants';

export const programCardSx = {
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: '0px 4px 24px rgba(145, 158, 171, 0.12)',
  p: { xs: 2.5, md: 4 },
};

export const programFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: 'background.paper',
    fontSize: 14,
    '& fieldset': {
      borderColor: FIELD_BORDER_COLOR,
    },
    '&:hover fieldset': {
      borderColor: FIELD_BORDER_COLOR,
    },
    '&.Mui-focused fieldset': {
      borderColor: FIELD_BORDER_COLOR,
      borderWidth: '1px',
    },
  },
  '& .MuiOutlinedInput-input': {
    fontSize: 14,
    '&::placeholder': {
      color: FIELD_PLACEHOLDER_COLOR,
      opacity: 1,
      fontSize: 14,
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none',
  },
};

export const programPlaceholderTextSx = {
  color: FIELD_PLACEHOLDER_COLOR,
  fontSize: 14,
  fontWeight: 400,
};

export const programTitleSx = {
  color: PROGRAM_TEAL_DARK,
  fontWeight: 700,
  mb: 3,
};

export const programSectionTitleSx = {
  color: FIELD_LABEL_COLOR,
  fontWeight: 600,
  fontSize: 16,
  mb: 2,
};

export const dashedAddButtonSx = {
  borderStyle: 'dashed',
  borderColor: 'grey.300',
  borderRadius: '12px',
  color: PROGRAM_TEAL,
  py: 1.75,
  fontWeight: 600,
  '&:hover': {
    borderStyle: 'dashed',
    borderColor: PROGRAM_TEAL,
    bgcolor: 'rgba(58, 176, 173, 0.04)',
  },
};

export const programPrimaryButtonSx = {
  borderRadius: '40px',
  py: 1.5,
  px: 4,
  fontWeight: 600,
  fontSize: '1rem',
  bgcolor: PROGRAM_TEAL,
  color: 'common.white',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: PROGRAM_TEAL_DARK,
    boxShadow: 'none',
  },
};

export const programOutlinedButtonSx = {
  borderRadius: '40px',
  py: 1.5,
  px: 4,
  fontWeight: 600,
  fontSize: '1rem',
  borderColor: PROGRAM_TEAL,
  color: PROGRAM_TEAL,
  '&:hover': {
    borderColor: PROGRAM_TEAL_DARK,
    bgcolor: 'rgba(58, 176, 173, 0.04)',
  },
};

export const programSwitchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#ffffff',
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: PROGRAM_TEAL,
    opacity: 1,
  },
};

export const innerCardSx = {
  border: '1px solid',
  borderColor: 'grey.200',
  borderRadius: '12px',
  p: { xs: 2, md: 3 },
  mb: 2,
};
