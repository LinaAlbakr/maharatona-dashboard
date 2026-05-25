import { Avatar, Box, Card, ListItemText, Typography } from '@mui/material';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';

type props = {
  course: any;
};

const LABEL_BLUE = '#2065B2';
const VALUE_PINK = '#CC3899';

const CourseCard = ({ course }: props) => {
  const { t } = useTranslate();
  const categoryName =
    course?.field &&
    (i18n.language === 'ar' ? course.field?.name_ar : course.field?.name_en);

  return (
    <Card
      sx={{
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <Avatar
        sx={{ width: 150, height: 150 }}
        src={course.course_images?.[0]?.trim() || '/assets/images/centers/gray.jpeg'}
      />
      <Typography variant="h4" color="info.dark">
        {i18n.language === 'ar' ? (course?.name_ar || course?.name) : (course?.name_en || course?.name)}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <ListItemText
          sx={{
            gridColumn: 'span',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          primary={t('LABEL.NO_OF_REGISTRANTS')}
          secondary={course.enrolled_children ?? 0}
          primaryTypographyProps={{
            sx: { color: LABEL_BLUE, fontSize: '16px', fontWeight: 700 },
          }}
          secondaryTypographyProps={{
            sx: { color: VALUE_PINK, fontSize: '14px', fontWeight: 700 },
          }}
        />
        <ListItemText
          primary={t('LABEL.CATEGORY')}
          secondary={categoryName || '-'}
          primaryTypographyProps={{
            sx: { color: LABEL_BLUE, fontWeight: 700 },
          }}
          secondaryTypographyProps={{
            sx: { color: VALUE_PINK, fontWeight: 700 },
          }}
        />
      </Box>
    </Card>
  );
};

export default CourseCard;
