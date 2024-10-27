import { Avatar, Box, Card, ListItemText, Typography } from '@mui/material';
import { useTranslate } from 'src/locales';

type props = {
  course: any;
};

const CourseCard = ({ course }: props) => {
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
      <Avatar sx={{ width: 150, height: 150 }} src={course.logo_url}></Avatar>
      <Typography variant="body1" color="initial">
        {course.name}
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
          secondary={course.number_of_users | 0}
          secondaryTypographyProps={{ color: 'info.dark', fontSize: '20px', fontWeight: 'bold' }}
        />{' '}
        <ListItemText
          sx={{
            gridColumn: 'span',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
          primary={t('LABEL.FIELD_NAME')}
          secondary={course.field.name}
          secondaryTypographyProps={{
            color: 'info.dark',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        />
      </Box>
    </Card>
  );
};

export default CourseCard;
