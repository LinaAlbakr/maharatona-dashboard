'use client';

import { useState } from 'react';
import { Map, Marker, APIProvider } from '@vis.gl/react-google-maps';

import Box from '@mui/material/Box';
import { Position } from 'src/@types/map';

/** Viewport only when the center has no lat/lng yet (Riyadh). Not a saved location. */
const ComponentDefaultPosition = { lat: 24.7136, lng: 46.6753 };

type Props = {
  staticPosition?: boolean;
  defaultPosition?: Position | undefined;
  defaultZoom?: number | undefined;
  setCurrentPosition?: (newPosition: Position) => void;
};

export function GoogleMap({
  staticPosition,
  defaultPosition,
  defaultZoom,
  setCurrentPosition,
}: Props) {
  const [position, setPosition] = useState<Position | undefined>(defaultPosition);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ''}>
      <Box height="100%">
        <Map
          defaultCenter={defaultPosition || ComponentDefaultPosition}
          defaultZoom={defaultZoom ?? 17}
          disableDefaultUI
          onClick={(e) => {
            setPosition((prev) => {
              const newPosition: Position | undefined = e.detail.latLng
                ? { ...e.detail.latLng }
                : prev;
              if (setCurrentPosition && newPosition) setCurrentPosition(newPosition);
              return staticPosition ? prev : newPosition;
            });
          }}
        >
          {position ? <Marker position={position} /> : null}
        </Map>
      </Box>
    </APIProvider>
  );
}
