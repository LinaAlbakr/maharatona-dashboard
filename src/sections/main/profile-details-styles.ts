import {
  FIELD_CONTENT_COLOR,
  FIELD_LABEL_COLOR,
} from 'src/sections/main/centers/add-program/constants';

export const profileDetailSectionTitleSx = {
  px: 4,
  color: FIELD_LABEL_COLOR,
};

export const profileDetailFieldSx = {
  gridColumn: 'span',
  color: FIELD_LABEL_COLOR,
};

export const profileDetailValueTypographyProps = {
  color: FIELD_CONTENT_COLOR,
  fontSize: '12px',
};

export const profileDetailValueTypographyPropsLtr = {
  ...profileDetailValueTypographyProps,
  dir: 'ltr' as const,
  textAlign: 'left' as const,
};

export const profileDetailImageLabelSx = {
  color: FIELD_LABEL_COLOR,
};
