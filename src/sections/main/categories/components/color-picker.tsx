import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { SketchPicker } from 'react-color';

const ColorPicker = () => {
  const [color, setColor] = useState('#fff');
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (newColor: { hex: React.SetStateAction<string> }) => {
    setColor(newColor.hex);
  };

  return (
    <Box sx={{ zIndex: 9999 }}>
      <Button
        variant="contained"
        onClick={() => setShowPicker(!showPicker)}
        style={{ backgroundColor: color, color: color.includes('0') ? '#fff' : '#000' }}
      >
        Pick Color
      </Button>
      {showPicker && (
        <Box mt={2}>
          <SketchPicker color={color} onChange={handleColorChange} />
        </Box>
      )}
    </Box>
  );
};

export default ColorPicker;
