import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Card, { CardProps } from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';

import { fPercent } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type ItemProps = {
  label: string;
  value: number;
};

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  data: ItemProps[];
}

export default function EcommerceSalesOverview({ title, subheader, data, ...other }: Props) {
  return (
    <Card {...other} sx={{height: "100%"}}>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={4} sx={{ px: 3, pt: 4, pb: 6 }}>
        {data.map((progress) => (
          <ProgressItem key={progress.label} progress={progress} />
        ))}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ProgressItemProps = {
  progress: ItemProps;
};

function ProgressItem({ progress }: ProgressItemProps) {
  return (
    <Stack spacing={1} sx={{pb:4}}>
      <Stack direction="row" alignItems="center">
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {progress.label}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {fPercent(progress.value)}
        </Typography>
      </Stack>

      <LinearProgress
        sx={{ height: 10 }}
        variant="determinate"
        value={progress.value}
        color={(progress.value > 85 && 'error') || (progress.value > 50 && 'warning') || 'primary'}
      />
    </Stack>
  );
}
