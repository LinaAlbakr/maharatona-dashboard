'use client';

import Button, { ButtonProps } from '@mui/material/Button';
import { useRouter } from 'next/navigation';

import Iconify from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';

type PageBackButtonProps = ButtonProps & {
  /** Used when browser history is empty (e.g. direct link open). */
  fallbackHref?: string;
};

export default function PageBackButton({
  fallbackHref,
  sx,
  ...other
}: PageBackButtonProps) {
  const router = useRouter();
  const { t } = useTranslate();
  const isRtl = i18n.language === 'ar';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant="text"
      color="inherit"
      onClick={handleBack}
      startIcon={
        <Iconify
          icon={isRtl ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
          width={18}
        />
      }
      sx={{
        alignSelf: 'flex-start',
        color: 'text.secondary',
        fontWeight: 600,
        px: 0,
        minWidth: 0,
        '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
        ...sx,
      }}
      {...other}
    >
      {t('BUTTON.BACK')}
    </Button>
  );
}
