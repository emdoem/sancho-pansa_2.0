import { Slider, type SliderProps, Stack, Typography } from '@mui/joy';

interface ProgressSliderProps extends Omit<SliderProps, 'children'> {
  currentTime?: string;
  totalTime?: string;
}

export const ProgressSlider = ({
  currentTime = '0:00',
  totalTime = '0:00',
  ...props
}: ProgressSliderProps) => (
  <Stack direction="row" alignItems="center" sx={{ width: '100%', gap: 2 }}>
    <Typography level="body-xs" sx={{ minWidth: 40, textAlign: 'right' }}>
      {currentTime}
    </Typography>
    <Slider size="sm" defaultValue={0} sx={{ flex: 1 }} {...props} />
    <Typography level="body-xs" sx={{ minWidth: 40 }}>
      {totalTime}
    </Typography>
  </Stack>
);
