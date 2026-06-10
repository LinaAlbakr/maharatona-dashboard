import { Avatar, Box, Card, ListItemText, Typography } from '@mui/material';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';
import { resolveCourseImageUrl } from 'src/sections/main/courses/course-details/utils';

const LABEL_BLUE = '#2065B2';
const VALUE_PINK = '#CC3899';

type props = {
  course: any;
};

const CourseCardReport = ({ course }: props) => {
  const { t } = useTranslate();
  const imageUrl = resolveCourseImageUrl(course.course_images?.[0]);

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
        src={imageUrl || undefined}
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
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          primary={t('LABEL.NO_OF_REGISTRANTS')}
          secondary={course.registrants}
          primaryTypographyProps={{
            sx: { color: LABEL_BLUE, fontWeight: 700 },
          }}
          secondaryTypographyProps={{
            sx: { color: VALUE_PINK, fontSize: '17px', fontWeight: 'bold' },
          }}
        />
        <ListItemText
          primary={t('LABEL.CATEGORY')}
          secondary={
            course?.feild
              ? i18n.language === 'ar'
                ? course.feild?.name_ar
                : course.feild?.name_en
              : '-'
          }
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

export default CourseCardReport;
