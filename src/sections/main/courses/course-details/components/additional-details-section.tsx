'use client';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { RiyalIcon } from 'src/sections/main/centers/add-program/components/course-icons';

import {
  addonsMaterialsSubsectionTitleSx,
  detailGridSx,
  detailLabelSx,
  detailValueSx,
  questionCheckboxLabelSx,
  questionCheckboxSx,
  questionNumberBadgeSx,
  questionsSubsectionTitleSx,
} from '../styles';
import { getLocalizedText } from '../utils';
import DetailField from './detail-field';
import DetailSectionCard from './detail-section-card';

function PriceValue({ amount }: { amount: number | string | null | undefined }) {
  if (amount === null || amount === undefined || amount === '') return <>-</>;
  return (
    <Box sx={{ ...detailValueSx, display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <RiyalIcon />
      <Box component="span">{Math.floor(Number(amount))}</Box>
    </Box>
  );
}

function QuestionRow({
  index,
  text,
  isFill,
  isYesNo,
}: {
  index: number;
  text: string;
  isFill?: boolean;
  isYesNo?: boolean;
}) {
  const { t } = useTranslate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexWrap: 'wrap',
        gap: 1.5,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box component="span" sx={questionNumberBadgeSx}>
        {index}
      </Box>
      <Typography sx={detailValueSx}>{text}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, ml: '20px' }}>
        <FormControlLabel
          control={
            <Checkbox checked={Boolean(isFill)} disabled size="small" sx={questionCheckboxSx} />
          }
          label={t('ADD_PROGRAM.FILL')}
          sx={questionCheckboxLabelSx}
        />
        <FormControlLabel
          control={
            <Checkbox checked={Boolean(isYesNo)} disabled size="small" sx={questionCheckboxSx} />
          }
          label={t('ADD_PROGRAM.YES_NO')}
          sx={questionCheckboxLabelSx}
        />
      </Box>
    </Box>
  );
}

type Props = {
  questions: any[];
  materials: any[];
  isArabic: boolean;
};

export default function AdditionalDetailsSection({ questions, materials, isArabic }: Props) {
  const { t } = useTranslate();

  if (!questions.length && !materials.length) return null;

  return (
    <DetailSectionCard title={t('PROGRAM_DETAILS.ADDITIONAL_SECTION')}>
      {questions.length > 0 && (
        <Box sx={{ mb: materials.length > 0 ? 3 : 0 }}>
          <Typography sx={questionsSubsectionTitleSx}>{t('ADD_PROGRAM.QUESTIONS')}</Typography>
          {questions.map((question: any, index: number) => (
            <QuestionRow
              key={index}
              index={index + 1}
              text={getLocalizedText(isArabic, question.question_ar, question.question_en, '')}
              isFill={question.isFill}
              isYesNo={question.isYesNo}
            />
          ))}
        </Box>
      )}

      {materials.map((material: any, index: number) => (
        <Box key={index} sx={{ mt: index > 0 ? 3 : 0 }}>
          <Typography sx={addonsMaterialsSubsectionTitleSx}>
            {t('ADD_PROGRAM.ADDONS_MATERIALS')}
          </Typography>
          <Box sx={detailGridSx}>
            <DetailField
              label={t('LABEL.NAME')}
              value={getLocalizedText(isArabic, material.name_ar, material.name_en)}
            />
            <DetailField label={t('LABEL.PRICE')} value={<PriceValue amount={material.price} />} />
            <DetailField
              label={t('LABEL.DESCRIPTION')}
              fullWidth
              value={getLocalizedText(isArabic, material.desc_ar, material.desc_en)}
            />
          </Box>
        </Box>
      ))}
    </DetailSectionCard>
  );
}
