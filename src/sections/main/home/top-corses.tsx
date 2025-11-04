'use client';

import { useTranslate } from 'src/locales';
import { Avatar, Card, Typography, Box } from '@mui/material';

import i18n from 'src/locales/i18n';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

type props = {
  count: number;
  courses: any[];
};

const TopCoursesTableView = ({ count, courses }: Readonly<props>) => {
  const { t } = useTranslate();

  const TABLE_HEAD = [
    { id: 'logo_url', label: 'LABEL.IMAGE' },
    { id: 'name', label: 'LABEL.COURSE_NAME' },
    { id: 'field', label: 'LABEL.FIELD' },
    { id: 'number_of_users', label: 'LABEL.NUMBER_OF_USERS' },
  ];

  return (
    <Card>
      <Typography variant="h4" color="secondary" sx={{ px: 4, py: 2 }}>
        {t('LABEL.TOP_COURSES')}
      </Typography>
      <SharedTable
        count={count}
        data={courses}
        tableHead={TABLE_HEAD}
        customRender={{
          logo_url: (item: any) => (
            <Avatar 
              alt={item?.name || (i18n.language === 'ar' ? item?.name_ar : item?.name_en)} 
              src={item?.logo_url || (Array.isArray(item?.course_images) && item.course_images.length > 0 ? item.course_images[0] : '')} 
            />
          ),
          name: (item: any) => (
            <Box>
              {item?.name || (i18n.language === 'ar' ? item?.name_ar : item?.name_en) || '-'}
            </Box>
          ),
          field: (item: any) => (
            i18n.language === 'ar' 
              ? (item?.field?.name_ar || item?.field?.name || '-')
              : (item?.field?.name_en || item?.field?.name || '-')
          ),
          number_of_users: (item: any) => (
            <Box>
              {item?.number_of_users ?? (Array.isArray(item?.clients) ? item.clients.length : 0)}
            </Box>
          ),
        }}
        headColor="primary.common"
      />
    </Card>
  );
};

export default TopCoursesTableView;
