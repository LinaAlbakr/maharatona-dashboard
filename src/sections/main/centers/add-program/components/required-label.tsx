import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
  children: React.ReactNode;
  required?: boolean;
};

export default function RequiredLabel({ children, required = false }: Props) {
  return (
    <Typography
      component="label"
      variant="body2"
      sx={{ mb: 1, display: 'block', fontWeight: 500, color: 'text.primary' }}
    >
      {children}
      {required ? (
        <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
          *
        </Box>
      ) : null}
    </Typography>
  );
}
