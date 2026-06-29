'use client';

import { useState } from 'react';
import { Map, Marker, APIProvider } from '@vis.gl/react-google-maps';

import Box from '@mui/material/Box';
import { Position } from 'src/@types/map';

const ComponentDefaultPosition = { lat: 15.300955, lng: 44.188427 };

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
