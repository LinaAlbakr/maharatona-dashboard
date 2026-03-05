import { FileRejection } from 'react-dropzone';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fData } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';

import { fileData } from '../file-thumbnail';

// ----------------------------------------------------------------------

type Props = {
  fileRejections: FileRejection[];
};

export default function RejectionFiles({ fileRejections }: Props) {
  const { t } = useTranslate();
  if (!fileRejections.length) {
    return null;
  }
  return (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        textAlign: 'left',
        borderStyle: 'dashed',
        borderColor: 'error.main',
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
      }}
    >
      {fileRejections.map(({ file, errors }) => {
        const { path, size } = fileData(file);

        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {size ? fData(size) : ''}
            </Typography>

            {errors.map((error) => (
              <Box key={error.code} component="span" sx={{ typography: 'caption' }}>
                - {convertFileSize(error.message, t)}
              </Box>
            ))}
          </Box>
        );
      })}
    </Paper>
  );
}

function convertFileSize(message: string, t: (arg: string) => string) {
  // Regex to extract the number from the message
  const regex = /File is larger than (\d+) bytes/;
  const match = message.match(regex);

  if (match) {
    const bytes = parseInt(match[1], 10);

    // Return the message with the converted size
    return `${t('File is larger than')} ${fData(bytes)}`;
  }
  // Return the original message if the format does not match
  return message;
}
