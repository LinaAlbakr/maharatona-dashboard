import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';

import { fNumber, fPercent } from 'src/utils/format-number';

import { shadows } from 'src/theme/shadows';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  total: number;
  percent: number;
  icon: string;
}

export default function AppWidgetSummary({ title, percent, total, icon, sx, ...other }: Props) {
  const settings = useSettingsContext();

 const  percentage = (percent > 0 && `${fPercent(percent)}  +`) || (percent < 0 && fPercent(percent)) || '0%'

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        '&:hover': {
          boxShadow: shadows(settings.themeMode),
        },
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
        <Iconify
          width={35}
          icon={icon}
          sx={{
            mr: 1,
            color: 'info.main',
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3">{fNumber(total)}</Typography>
        <Typography variant="body2">{title}</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
          <Iconify
            width={24}
            icon={
              (percent < 0 && 'solar:double-alt-arrow-down-bold-duotone') ||
              (percent > 0 && 'solar:double-alt-arrow-up-bold-duotone') ||
              ' '
            }
            sx={{
              mr: 1,
              color: 'success.main',
              ...(percent < 0 && {
                color: 'error.main',
              }),
            }}
          />

          <Typography component="div" variant="subtitle2">
            {percentage}
          </Typography>
        </Stack>
        <Typography variant="caption">+10 this week</Typography>
      </Box>
    </Card>
  );
}
