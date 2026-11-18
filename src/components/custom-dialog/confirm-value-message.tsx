'use client';

import type { CSSProperties } from 'react';

import { useTranslate } from 'src/locales';

type ConfirmValueMessageProps = {
  i18nKey: string;
  valueKey: 'mobileNumber' | 'programName';
  value: string;
};

const boldValueStyle: CSSProperties = {
  fontWeight: 700,
  textDecoration: 'none',
  color: 'inherit',
};

/** Renders a confirm string with the interpolated value bold and without underline. */
export default function ConfirmValueMessage({
  i18nKey,
  valueKey,
  value,
}: ConfirmValueMessageProps) {
  const { t } = useTranslate();
  const text = t(i18nKey, { [valueKey]: value });
  const idx = value ? text.indexOf(value) : -1;

  if (idx < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, idx)}
      <strong className="confirm-dialog-value" style={boldValueStyle}>
        {value}
      </strong>
      {text.slice(idx + value.length)}
    </>
  );
}
