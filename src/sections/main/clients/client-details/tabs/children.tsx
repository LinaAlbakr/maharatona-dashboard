'use client';

import Container from '@mui/material/Container';
import { useTranslate } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';
import {  Card,  InputAdornment, TextField } from '@mui/material';
import FormProvider from 'src/components/hook-form';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';
import Iconify from 'src/components/iconify';

type props = {
  ClientChildren: any;
};

const Children = ({ ClientChildren }: Readonly<props>) => {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    router.push(`${pathname}/?tab=children`);
  }, []);

  const TABLE_HEAD = [
    { id: 'name', label: 'LABEL.NAME' },
    { id: 'age', label: 'LABEL.AGE' },
  ];

  const formDefaultValues = {
    name: '',
  };

  const pathname = usePathname();
  const methods = useForm({
    defaultValues: formDefaultValues,
  });

  // Filter children based on search term
  const filteredChildren = useMemo(() => {
    if (!searchTerm) {
      return ClientChildren?.data || [];
    }
    return (ClientChildren?.data || []).filter((child: any) =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ClientChildren?.data, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'sm'}>
        <Card sx={{ p: 2 }}>
          <FormProvider methods={methods}>
            <TextField
              sx={{ width: '100%', mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mingcute:search-line" />
                  </InputAdornment>
                ),
              }}
              placeholder={t('LABEL.SEARCH_BY_NAME')}
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </FormProvider>
          <SharedTable
            count={filteredChildren.length}
            data={filteredChildren}
            tableHead={TABLE_HEAD}
          />
        </Card>
      </Container>
    </>
  );
};

export default Children;
