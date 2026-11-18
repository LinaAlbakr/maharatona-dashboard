import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  ...other
}: ConfirmDialogProps) {
  const { t } = useTranslate();
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      {content && (
        <DialogContent
          // Avoid OS/browser phone linking (underline on +966… in confirm text)
          {...({ 'x-ms-format-detection': 'none' } as object)}
          sx={{
            typography: 'body2',
            fontWeight: 400,
            minHeight: '50px',
            '& .confirm-dialog-value, & .confirm-dialog-value a, & strong.confirm-dialog-value': {
              fontWeight: '700 !important',
              textDecoration: 'none',
              color: 'inherit',
            },
            '& a[href^="tel:"]': {
              color: 'inherit',
              fontWeight: '700 !important',
              textDecoration: 'none',
              pointerEvents: 'none',
            },
          }}
        >
          {content}
        </DialogContent>
      )}


      <DialogActions>
        <Button
          variant="contained"
          sx={{
            color: 'primary.common',
            bgcolor: 'white',
            border: '1px solid #DBE0E4',
            '&:hover': {
              bgcolor: '#DBE0E5',
              border: '1px solid #DBE0E4',
            },
          }}
          onClick={onClose}
        >
          {t('BUTTON.CANCEL')}
        </Button>

        {action}
      </DialogActions>
    </Dialog>
  );
}
