'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function AboutAppPage() {
  const router = useRouter();

  useEffect(() => {
    router.push(paths.dashboard.pages.about);
  }, [router]);

  return null;
}
