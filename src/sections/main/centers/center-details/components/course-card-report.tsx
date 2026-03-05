import { Avatar, Box, Card, ListItemText, Typography } from '@mui/material';
import { useTranslate } from 'src/locales';
import i18n from 'src/locales/i18n';

type props = {
  course: any;
};

const CourseCardReport = ({ course }: props) => {
  const { t } = useTranslate();

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
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          primary={t('LABEL.NUMBER_OF_REGISTRANTS')}
          secondary={course.registrants}
          secondaryTypographyProps={{ color: 'info.dark', fontSize: '17px', fontWeight: 'bold' }}
        />{' '}
        <ListItemText
          primary={t('LABEL.FIELD_NAME')}
          secondary={
            // eslint-disable-next-line no-nested-ternary
            course?.feild
              ? i18n.language === 'ar'
                ? course.feild?.name_ar
                : course.feild?.name_en
              : '-'
          }
          primaryTypographyProps={{
            sx: { color: 'info.dark', fontWeight: "700" },
          }}
          secondaryTypographyProps={{
            sx: { color: 'primary.main', fontWeight: "700" },
          }}
        />
      </Box>
    </Card>
  );
};

export default CourseCardReport;
