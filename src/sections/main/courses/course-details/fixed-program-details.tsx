'use client';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useRouter } from 'next/navigation';

import i18n from 'src/locales/i18n';
import { useTranslate } from 'src/locales';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';

import DetailField from './components/detail-field';
import PriceWithDiscountValue from './components/price-with-discount-value';
import PriceValue from './components/price-value';
import DetailSectionCard from './components/detail-section-card';
import ProgramDetailHeader from './components/program-detail-header';
import ProgramPicturesGallery from './components/program-pictures-gallery';
import {
  addonsMaterialsSubsectionTitleSx,
  detailSubsectionTitleSx,
  detailValueSx,
  discountValueBoxSx,
  discountPercentValueSx,
  specificDiscountCardSx,
  specificDiscountCardTitleSx,
  specificDiscountTableContainerSx,
  specificDiscountTableHeaderCellSx,
  specificDiscountTableHeaderSx,
  specificDiscountTableRowSx,
  specificDiscountTableValueSx,
  specificDiscountTitleSx,
  specificDiscountWrapperSx,
  questionCheckboxLabelSx,
  questionCheckboxSx,
  questionNumberBadgeSx,
  questionsSubsectionTitleSx,
} from './styles';
import {
  formatAgeYears,
  formatProgramDate,
  formatProgramTime,
  getCourseImageUrls,
  getLocalizedText,
  getSessionAgeDisplay,
} from './utils';

type Props = {
  course: any;
};

const detailGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
  gap: { xs: 2, md: 3 },
};

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

function SpecificDiscountCard({
  title,
  rows,
}: {
  title: string;
  rows: { no_of_kids?: number; discount?: number }[];
}) {
  const { t } = useTranslate();

  if (!rows.length) return null;

  return (
    <Box sx={{ ...specificDiscountCardSx, ...specificDiscountTableContainerSx }}>
      <Typography sx={specificDiscountCardTitleSx}>{title}</Typography>

      <Box sx={specificDiscountTableHeaderSx}>
        <Typography sx={specificDiscountTableHeaderCellSx}>
          {t('ADD_PROGRAM.NO_OF_KIDS')}
        </Typography>
        <Typography sx={specificDiscountTableHeaderCellSx}>
          {t('ADD_PROGRAM.DISCOUNT_PERCENT')}
        </Typography>
      </Box>

      {rows.map((row, index) => (
        <Box key={`${row.no_of_kids}-${index}`} sx={specificDiscountTableRowSx}>
          <Typography sx={specificDiscountTableValueSx}>
            {row.no_of_kids ?? '-'}
          </Typography>
          <Typography sx={specificDiscountTableValueSx}>
            {row.discount != null ? `${row.discount}%` : '-'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SpecificDiscountSection({
  groups,
  isArabic,
}: {
  groups: any[];
  isArabic: boolean;
}) {
  const { t } = useTranslate();

  if (!groups.length) return null;

  return (
    <Box>
      <Typography sx={specificDiscountTitleSx}>{t('ADD_PROGRAM.SPECIFIC_DISCOUNT')}</Typography>
      <Box sx={specificDiscountWrapperSx}>
        {groups.map((group, index) => (
          <SpecificDiscountCard
            key={index}
            title={getLocalizedText(
              isArabic,
              group.title_ar,
              group.title_en,
              t('ADD_PROGRAM.SPECIFIC_DISCOUNT')
            )}
            rows={group.discounts || []}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function FixedProgramDetailsView({ course }: Props) {
  const settings = useSettingsContext();
  const router = useRouter();
  const { t } = useTranslate();
  const isArabic = i18n.language === 'ar';
  const courseId = String(course?.id ?? course?._id ?? '');
  const sessionAges = getSessionAgeDisplay(course);

  const images = getCourseImageUrls(course?.course_images);
  const questions = (course?.additional_questions || []).filter(
    (item: any) => item?.question_ar?.trim() || item?.question_en?.trim()
  );
  const materials = (course?.addOnMaterials || []).filter(
    (item: any) =>
      item?.name_ar?.trim() ||
      item?.name_en?.trim() ||
      item?.desc_ar?.trim() ||
      item?.desc_en?.trim() ||
      item?.price
  );
  const discountType = String(course?.discount_type ?? '').toLowerCase();
  const isTotalDiscount = discountType === 'total';
  const isSpecificDiscount = discountType === 'specific';

  const hasTotalDiscount =
    isTotalDiscount && Number(course?.discount_amount) > 0;
  const specificDiscounts = isSpecificDiscount
    ? (course?.discount || []).filter(
        (group: any) => Array.isArray(group?.discounts) && group.discounts.length > 0
      )
    : [];

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'Mixed':
        return t('ADD_PROGRAM.GENDER_MIXED');
      case 'Boys':
        return t('ADD_PROGRAM.GENDER_BOYS');
      case 'Girls':
        return t('ADD_PROGRAM.GENDER_GIRLS');
      default:
        return gender || '-';
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ py: { xs: 2, md: 3 } }}>
      <ProgramDetailHeader
        onEdit={
          courseId
            ? () => {
                router.push(paths.dashboard.courseEdit(courseId));
              }
            : undefined
        }
      />

      <DetailSectionCard title={t('PROGRAM_DETAILS.PROGRAM_SECTION')}>
        <ProgramPicturesGallery
          images={images}
          title={t('ADD_PROGRAM.PROGRAM_PICTURES')}
        />

        <Box sx={detailGridSx}>
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_NAME_AR')}
            value={course?.name_ar?.trim() || '-'}
          />
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_NAME_EN')}
            value={course?.name_en?.trim() || '-'}
          />
          <DetailField label={t('LABEL.START_DATE')} value={formatProgramDate(course?.start_date)} />
          <DetailField label={t('LABEL.END_DATE')} value={formatProgramDate(course?.end_date)} />
          <DetailField
            label={t('LABEL.PRICE')}
            value={<PriceWithDiscountValue amount={course?.price} course={course} />}
          />
          <DetailField
            label={t('LABEL.CATEGORY')}
            value={getLocalizedText(
              isArabic,
              course?.field?.name_ar,
              course?.field?.name_en || course?.field?.name
            )}
          />
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_DESCRIPTION_AR')}
            fullWidth
            value={(course?.description_ar || course?.desc_ar)?.trim() || '-'}
          />
          <DetailField
            label={t('PROGRAM_DETAILS.PROGRAM_DESCRIPTION_EN')}
            fullWidth
            value={(course?.description_en || course?.desc_en)?.trim() || '-'}
          />
        </Box>
      </DetailSectionCard>

      <DetailSectionCard title={t('PROGRAM_DETAILS.SESSION_SECTION')}>
        <Box sx={detailGridSx}>
          <DetailField
            label={t('ADD_PROGRAM.START_TIME')}
            value={formatProgramTime(course?.start_time)}
          />
          <DetailField
            label={t('ADD_PROGRAM.END_TIME')}
            value={formatProgramTime(course?.end_time)}
          />
          <DetailField label={t('ADD_PROGRAM.GENDER')} value={getGenderLabel(course?.gender)} />
          <DetailField
            label={t('ADD_PROGRAM.SEAT_CAPACITY')}
            value={course?.fixed_total_seats ?? course?.seat_capacity ?? course?.seats ?? '-'}
          />

          {sessionAges.mode === 'single' ? (
            <>
              <DetailField
                label={t('ADD_PROGRAM.AGE_FROM')}
                value={formatAgeYears(sessionAges.ageFrom, t('PROGRAM_DETAILS.YEARS'))}
              />
              <DetailField
                label={t('ADD_PROGRAM.AGE_TO')}
                value={formatAgeYears(sessionAges.ageTo, t('PROGRAM_DETAILS.YEARS'))}
              />
            </>
          ) : (
            <>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={detailSubsectionTitleSx}>{t('ADD_PROGRAM.BOYS')}</Typography>
                <Box sx={{ ...detailGridSx, mb: 2 }}>
                  <DetailField
                    label={t('ADD_PROGRAM.AGE_FROM')}
                    value={formatAgeYears(sessionAges.boysFrom, t('PROGRAM_DETAILS.YEARS'))}
                  />
                  <DetailField
                    label={t('ADD_PROGRAM.AGE_TO')}
                    value={formatAgeYears(sessionAges.boysTo, t('PROGRAM_DETAILS.YEARS'))}
                  />
                </Box>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography sx={detailSubsectionTitleSx}>{t('ADD_PROGRAM.GIRLS')}</Typography>
                <Box sx={detailGridSx}>
                  <DetailField
                    label={t('ADD_PROGRAM.AGE_FROM')}
                    value={formatAgeYears(sessionAges.girlsFrom, t('PROGRAM_DETAILS.YEARS'))}
                  />
                  <DetailField
                    label={t('ADD_PROGRAM.AGE_TO')}
                    value={formatAgeYears(sessionAges.girlsTo, t('PROGRAM_DETAILS.YEARS'))}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DetailSectionCard>

      {(questions.length > 0 || materials.length > 0) && (
        <DetailSectionCard title={t('PROGRAM_DETAILS.ADDITIONAL_SECTION')}>
          {questions.length > 0 && (
            <Box sx={{ mb: materials.length > 0 ? 3 : 0 }}>
              <Typography sx={questionsSubsectionTitleSx}>{t('ADD_PROGRAM.QUESTIONS')}</Typography>
              {questions.map((question: any, index: number) => (
                <QuestionRow
                  key={index}
                  index={index + 1}
                  text={getLocalizedText(
                    isArabic,
                    question.question_ar,
                    question.question_en,
                    ''
                  )}
                  isFill={question.isFill}
                  isYesNo={question.isYesNo}
                />
              ))}
            </Box>
          )}

          {materials.map((material: any, index: number) => (
            <Box key={index} sx={{ mt: index > 0 ? 3 : 0 }}>
              <Typography sx={addonsMaterialsSubsectionTitleSx}>{t('ADD_PROGRAM.ADDONS_MATERIALS')}</Typography>
              <Box sx={detailGridSx}>
                <DetailField
                  label={t('LABEL.NAME')}
                  value={getLocalizedText(isArabic, material.name_ar, material.name_en)}
                />
                <DetailField
                  label={t('LABEL.PRICE')}
                  value={<PriceValue amount={material.price} />}
                />
                <DetailField
                  label={t('LABEL.DESCRIPTION')}
                  fullWidth
                  value={getLocalizedText(isArabic, material.desc_ar, material.desc_en)}
                />
              </Box>
            </Box>
          ))}
        </DetailSectionCard>
      )}

      {(hasTotalDiscount || specificDiscounts.length > 0) && (
        <DetailSectionCard title={t('PROGRAM_DETAILS.DISCOUNT_SECTION')}>
          {hasTotalDiscount && (
            <Box sx={{ mb: specificDiscounts.length > 0 ? 3 : 0 }}>
              <Typography sx={specificDiscountTitleSx}>{t('ADD_PROGRAM.TOTAL_DISCOUNT')}</Typography>
              <Box sx={discountValueBoxSx}>
                <Typography sx={discountPercentValueSx} component="span">
                  <span>{course.discount_amount}</span>
                  <span>%</span>
                </Typography>
              </Box>
            </Box>
          )}

          {specificDiscounts.length > 0 && (
            <SpecificDiscountSection groups={specificDiscounts} isArabic={isArabic} />
          )}
        </DetailSectionCard>
      )}
    </Container>
  );
}
