import { Slider, Stack } from '@mui/joy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface VolumeSliderProps {
  defaultValue?: number;
  onChange?: (value: number | number[]) => void;
}

export const VolumeSlider = ({
  defaultValue = 80,
  onChange,
}: VolumeSliderProps) => (
  <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
    <VolumeUpIcon sx={{ color: 'text.secondary' }} />
    <Slider
      size="sm"
      defaultValue={defaultValue}
      sx={{ width: 100 }}
      onChange={(_, value) => onChange?.(value)}
    />
  </Stack>
);
