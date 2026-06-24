'use client';

import Box from '@mui/material/Box';
import { usePathname } from 'next/navigation';

import PageBackButton from 'src/components/page-back-button';
import {
  resolveDashboardBackFallback,
  shouldShowDashboardBackButton,
} from 'src/utils/dashboard-inner-routes';

export default function DashboardInnerBackNav() {
  const pathname = usePathname() ?? '';

  if (!shouldShowDashboardBackButton(pathname)) {
    return null;
  }

  return (
    <Box sx={{ mb: 1 }}>
      <PageBackButton fallbackHref={resolveDashboardBackFallback(pathname)} />
    </Box>
  );
}
