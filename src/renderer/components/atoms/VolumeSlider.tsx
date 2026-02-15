import { Slider, Stack } from '@mui/joy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { mixins } from '../../theme/utilities';

interface VolumeSliderProps {
  defaultValue?: number;
  onChange?: (value: number | number[]) => void;
}

export const VolumeSlider = ({
  defaultValue = 80,
  onChange,
}: VolumeSliderProps) => (
  <Stack sx={{ gap: 2, ...mixins.flexCenter() }}>
    <VolumeUpIcon sx={{ color: 'text.secondary' }} />
    <Slider
      size="sm"
      defaultValue={defaultValue}
      sx={{ width: 100 }}
      onChange={(_, value) => onChange?.(value)}
    />
  </Stack>
);
