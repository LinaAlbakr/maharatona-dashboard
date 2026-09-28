import type { ReactNode } from 'react';

import { Box } from '@mui/material';

const boldSx = { fontWeight: '900 !important', color: '#006C9C' };

/** Strip decorative brackets/quotes from stored notification copy. */
export function stripDecorators(value: string): string {
  return String(value || '')
    .replace(/^[\s\[\]"'«»\u201C\u201D\u2018\u2019]+/, '')
    .replace(/[\s\[\]"'«»\u201C\u201D\u2018\u2019]+$/, '')
    .trim();
}

export function renderProgramNameTitle(title: string, isAr: boolean): ReactNode {
  const text = String(title || '').trim();
  if (!text) return title;

  if (isAr) {
    const match = text.match(/^اسم البرنامج:\s*(.+)$/i);
    if (!match) return stripDecorators(text) || text;
    const programName = stripDecorators(match[1]);
    return (
      <>
        اسم البرنامج:{' '}
        <Box component="strong" sx={boldSx}>
          {programName}
        </Box>
      </>
    );
  }

  const match = text.match(/^Program Name:\s*(.+)$/i);
  if (!match) return stripDecorators(text) || text;
  const programName = stripDecorators(match[1]);
  return (
    <>
      Program Name:{' '}
      <Box component="strong" sx={boldSx}>
        {programName}
      </Box>
    </>
  );
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

export function renderProgramDeletedMessage(message: string, isAr: boolean): ReactNode {
  const parsed = parseProgramDeletedMessage(message, isAr);
  if (!parsed?.centerName || !parsed?.programName) {
    return message;
  }

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

export function parseProgramCreatedMessage(
  message: string,
  isAr: boolean
): { centerName: string; programName: string } | null {
  const msg = String(message || '').trim();
  if (!msg) return null;

  if (isAr) {
    const match = msg.match(/^تم إنشاء برنامج جديد بواسطة\s*(.+?):\s*(.+)$/i);
    if (!match) return null;
    return {
      centerName: stripDecorators(match[1]),
      programName: stripDecorators(match[2]),
    };
  }

  const match = msg.match(/^(.+?)\s+has created a new (?:program|course):\s*(.+)$/i);
  if (!match) return null;
  return {
    centerName: stripDecorators(match[1]),
    programName: stripDecorators(match[2]),
  };
}

export function renderProgramCreatedMessage(message: string, isAr: boolean): ReactNode {
  const parsed = parseProgramCreatedMessage(message, isAr);
  if (!parsed?.centerName || !parsed?.programName) {
    return message;
  }

  if (isAr) {
    return (
      <>
        تم إنشاء برنامج جديد بواسطة{' '}
        <Box component="strong" sx={boldSx}>
          {parsed.centerName}
        </Box>
        :{' '}
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
      has created a new program:{' '}
      <Box component="strong" sx={boldSx}>
        {parsed.programName}
      </Box>
    </>
  );
}

/** Prefer deleted, then created; otherwise return original text. */
export function renderProgramLifecycleMessage(message: string, isAr: boolean): ReactNode {
  const deleted = parseProgramDeletedMessage(message, isAr);
  if (deleted?.centerName && deleted?.programName) {
    return renderProgramDeletedMessage(message, isAr);
  }
  const created = parseProgramCreatedMessage(message, isAr);
  if (created?.centerName && created?.programName) {
    return renderProgramCreatedMessage(message, isAr);
  }
  return message;
}
