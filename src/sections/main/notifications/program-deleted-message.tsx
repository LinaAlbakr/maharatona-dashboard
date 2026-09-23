import type { ReactNode } from 'react';

import { Box } from '@mui/material';

/** Strip decorative brackets/quotes from stored notification copy. */
export function stripDecorators(value: string): string {
  return String(value || '')
    .replace(/^[\s\[\]"'«»\u201C\u201D\u2018\u2019]+/, '')
    .replace(/[\s\[\]"'«»\u201C\u201D\u2018\u2019]+$/, '')
    .trim();
}

export function parseProgramDeletedMessage(
  message: string,
  isAr: boolean
): { centerName: string; programName: string } | null {
  const msg = String(message || '').trim();
  if (!msg) return null;

  if (isAr) {
    const match = msg.match(/^قام\s+(.+?)\s+بحذف البرنامج:\s*(.+)$/i);
    if (!match) return null;
    return {
      centerName: stripDecorators(match[1]),
      programName: stripDecorators(match[2]),
    };
  }

  const match = msg.match(/^(.+?)\s+has deleted the program:\s*(.+)$/i);
  if (!match) {
    const legacy = msg.match(/^(.+?)\s+has deleted a program:\s*(.+)$/i);
    if (!legacy) return null;
    return {
      centerName: stripDecorators(legacy[1]),
      programName: stripDecorators(legacy[2]),
    };
  }

  return {
    centerName: stripDecorators(match[1]),
    programName: stripDecorators(match[2]),
  };
}

export function renderProgramDeletedMessage(
  message: string,
  isAr: boolean
): ReactNode {
  const parsed = parseProgramDeletedMessage(message, isAr);
  if (!parsed?.centerName || !parsed?.programName) {
    return message;
  }

  const boldSx = { fontWeight: '900 !important', color: '#006C9C' };

  if (isAr) {
    return (
      <>
        قام{' '}
        <Box component="strong" sx={boldSx}>
          {parsed.centerName}
        </Box>{' '}
        بحذف البرنامج:{' '}
        <Box component="strong" sx={boldSx}>
          {parsed.programName}
        </Box>
      </>
    );
  }

  return (
    <>
      <Box component="strong" sx={boldSx}>
        {parsed.centerName}
      </Box>{' '}
      has deleted the program:{' '}
      <Box component="strong" sx={boldSx}>
        {parsed.programName}
      </Box>
    </>
  );
}
