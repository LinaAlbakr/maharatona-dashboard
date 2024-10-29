import { Box, Button, Menu, MenuItem, Rating, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { deleteRate } from 'src/actions/centers';
import  { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { fDate } from 'src/utils/format-time';

type props = {
  rate: any;
};
const RateItem = ({ rate }: props) => {
  const { t } = useTranslate();
  const params = useParams();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async () => {
    const res = await deleteRate(rate.id, params?.centerId);
    if (res?.error) {
      enqueueSnackbar(`${res?.error}`, { variant: 'error' });
    } else {
      enqueueSnackbar(t('MESSAGE.DELETED_SUCCESS'), {
        variant: 'success',
      });
    }

    setAnchorEl(null);
  };
  const popover = usePopover();
  function convertDate(dateString: string) {
    // Define an array with Arabic month names.
    const arabicMonths = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];

    // Split the input date into day and month.
    const [day, month] = dateString.split('-');

    // Convert the month number to an integer and get the corresponding Arabic month name.
    const monthName = arabicMonths[parseInt(month) - 1];

    // Return the formatted date.
    return `${day} ${monthName}`;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 80,
      }}
    >
      <Box>
        <Typography variant="h6" color="info.dark" fontWeight={700}>
          {rate.client.name}
        </Typography>
        <Typography variant="body1" color="info.dark">
          {rate.comment_center}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
          <Rating value={rate.rate_center} precision={0.5} readOnly />
          <Typography variant="body1" color="info.dark">
            {convertDate(fDate(rate?.created_at, 'dd-MM'))}
          </Typography>
        </Box>
        <Box>
          {' '}
          <Button sx={{ width: 'fit-content' }} onClick={handleClick}>
            <Iconify icon="eva:more-vertical-fill" />
          </Button>
          <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose}>delete</MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default RateItem;
