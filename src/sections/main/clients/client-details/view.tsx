'use client';

import { Box, Button, Card, Container, Tab, Tabs, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';

import { useSettingsContext } from 'src/components/settings';
import { useQueryString } from 'src/hooks/use-queryString';
import { useTranslate } from 'src/locales';
import { ITems } from 'src/components/AutoComplete/CutomAutocompleteView';
import AllInformation from './tabs/all-Information';

import { usePathname, useRouter } from 'next/navigation';
import Courses from './tabs/courses';
import Children from './tabs/children';
import EditClientDialog from './components/edit-client-dialog';

export const tabs = [
  {
    value: 'all-information',
    label: 'ALL_INFORMATION',
  },
  {
    value: 'children',
    label: 'CHILDREN',
  },
  {
    value: 'courses',
    label: 'COURSES',
  },
];

interface Props {
  tab?: string;
  ClientInfo?: any;
  ClientCourses?: any;
  ClientChildren?: any;
  cities?: ITems[];
  fields?: Array<{ id: string; name_en?: string; name_ar?: string; name?: string }>;
}

const ClientDetailsView = ({
  tab,
  ClientInfo,
  ClientCourses,
  ClientChildren,
  cities = [],
  fields = [],
}: Props) => {
  const { t } = useTranslate();
  const settings = useSettingsContext();
  const pathname = usePathname();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const currentTab = useMemo(
    () =>
      typeof tab === 'string' && tabs.find((item) => item.value === tab) ? tab : 'all-information',
    [tab]
  );

  const { createQueryString } = useQueryString();

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    createQueryString([{ name: 'tab', value: newValue }], true);
    router.push(`${pathname}?tab=${newValue}`);
  };
  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'xl'}
      sx={{ margin: '0px !important', padding: '0px !important' }}
    >
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Box
          sx={{
            backgroundImage: `url(/assets/images/clients/children.jpeg)`,
            height: { sm: '250px', xs: '300px' },
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            gap: 4,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              zIndex: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{ color: 'common.white', fontWeight: 700, textAlign: 'center' }}
            >
              {t('LABEL.CLIENT')}
            </Typography>
            <Button
              onClick={() => setEditOpen(true)}
              sx={{
                bgcolor: 'common.white',
                color: '#CC38A6',
                borderRadius: '999px',
                px: 4,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: 14,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              {`${t('BUTTON.EDIT')} ${t('LABEL.CLIENT')}`}
            </Button>
          </Box>
          <Box>
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ position: 'absolute', bottom: '-40px', left: '50px' }}
            >
              {ClientInfo.username || ClientInfo.name || '-'}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ mx: 4, mt: 4, display: 'flex', gap: 4, flexDirection: { sm: 'row', xs: 'column' } }}
        >
          <Tabs value={currentTab} onChange={handleChangeTab} sx={{ color: 'secondary.main' }}>
            {tabs.map((item) => (
              <Tab key={item.value} value={item.value} label={t(`LABEL.${item.label}`)} />
            ))}
          </Tabs>
        </Box>
      </Card>

      <Box mt={3}>
        {currentTab === 'all-information' && <AllInformation ClientInfo={ClientInfo} />}
        {currentTab === 'children' && <Children ClientChildren={ClientChildren} />}
        {currentTab === 'courses' && <Courses ClientCourses={ClientCourses} />}
      </Box>

      <EditClientDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        clientInfo={ClientInfo}
        cities={cities}
        fields={fields}
      />
    </Container>
  );
};

export default ClientDetailsView;
