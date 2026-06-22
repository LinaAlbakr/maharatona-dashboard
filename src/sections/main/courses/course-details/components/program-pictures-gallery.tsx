'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Lightbox, { useLightBox } from 'src/components/lightbox';

import { detailLabelSx } from '../styles';

type Props = {
  images: string[];
  title: string;
};

export default function ProgramPicturesGallery({ images, title }: Props) {
  const slides = useMemo(() => images.map((src) => ({ src })), [images]);
  const lightbox = useLightBox(slides);

  if (!images.length) return null;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ ...detailLabelSx, mb: 1.5 }}>{title}</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {images.map((src, index) => (
            <Box
              key={`${src}-${index}`}
              component="img"
              src={src}
              alt=""
              onClick={() => lightbox.onOpen(src)}
              sx={{
                width: 156,
                height: 90,
                borderRadius: '12px',
                objectFit: 'cover',
                bgcolor: 'grey.100',
                flexShrink: 0,
                cursor: 'pointer',
                transition: (theme) => theme.transitions.create(['opacity', 'box-shadow']),
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
        disabledVideo
        disabledCaptions
        disabledSlideshow
      />
    </>
  );
}
