/** Shared layout + styles for fixed-course and flexible “Manage Enrollment” confirm modals. */

export const enrollmentConfirmDialogPaperSx = {
  width: 'min(549px, calc(100% - 32px))',
  height: 180,
  minHeight: 180,
  maxHeight: 'min(180px, 90vh)',
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiDialogContent-root': {
    overflow: 'hidden',
    flex: '1 1 auto',
    minHeight: 0,
  },
} as const;

export const enrollmentConfirmDialogTitleSx = {
  color: '#484645',
  fontWeight: 700,
  fontSize: 24,
  lineHeight: 1.3,
  pb: 1,
  pl: 2.5,
  pr: 5,
  pt: 2,
  flexShrink: 0,
  position: 'relative',
} as const;

/** Close (×) glyph — readable on fixed + flexible enrollment confirm modals. */
export const enrollmentConfirmCloseIconifySx = {
  width: 22,
  height: 22,
  color: 'currentColor',
} as const;

/** Close (×) on the inline end; icon inherits color from button. */
export const enrollmentConfirmDialogCloseIconButtonSx = {
  position: 'absolute',
  top: 10,
  insetInlineEnd: 8,
  p: 1,
  color: '#212B36',
  '&:hover': { bgcolor: 'action.hover' },
} as const;

export const enrollmentConfirmDialogContentSx = {
  px: 2.5,
  pt: 0,
  pb: 1,
  overflow: 'hidden',
} as const;

export const enrollmentConfirmDialogMessageSx = {
  pt: 0.5,
  fontSize: 16,
  color: '#5D6064',
  fontWeight: 400,
  lineHeight: 1.5,
} as const;

export const enrollmentConfirmDialogBoldPhraseSx = {
  fontWeight: 700,
  color: '#5D6064',
  fontSize: 16,
} as const;

export const enrollmentConfirmDialogActionsSx = {
  px: 2.5,
  pb: 2,
  pt: 0.5,
  gap: 1.5,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  flexShrink: 0,
} as const;

export const enrollmentConfirmButtonConfirmSx = {
  width: 131,
  height: 40,
  minWidth: 131,
  minHeight: 40,
  maxHeight: 40,
  px: 0,
  py: 0,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.2,
  borderRadius: 1.5,
  textTransform: 'none',
  bgcolor: '#3CB8BB',
  color: '#fff',
  boxShadow: 'none',
  '&:hover': { bgcolor: '#35a5a8', boxShadow: 'none' },
} as const;

export const enrollmentConfirmButtonCancelSx = {
  width: 131,
  height: 40,
  minWidth: 131,
  minHeight: 40,
  maxHeight: 40,
  px: 0,
  py: 0,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.2,
  borderRadius: 1.5,
  textTransform: 'none',
  bgcolor: '#fff',
  color: '#637381',
  borderColor: 'rgba(99, 115, 129, 0.32)',
  boxShadow: 'none',
  '&:hover': {
    borderColor: 'rgba(99, 115, 129, 0.5)',
    bgcolor: '#fafafa',
    boxShadow: 'none',
  },
} as const;
