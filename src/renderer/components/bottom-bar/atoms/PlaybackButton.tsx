import { IconButton, type IconButtonProps } from '@mui/joy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';

type PlaybackButtonType = 'play' | 'next' | 'previous' | 'shuffle' | 'repeat';

interface PlaybackButtonProps
  extends Omit<IconButtonProps, 'type' | 'children'> {
  buttonType: PlaybackButtonType;
}

const icons: Record<PlaybackButtonType, React.ElementType> = {
  play: PlayArrowIcon,
  next: SkipNextIcon,
  previous: SkipPreviousIcon,
  shuffle: ShuffleIcon,
  repeat: RepeatIcon,
};

export const PlaybackButton = ({
  buttonType,
  ...props
}: PlaybackButtonProps) => {
  const Icon = icons[buttonType];

  const getVariant = (): IconButtonProps['variant'] => {
    if (buttonType === 'play') return 'solid';
    return 'plain';
  };

  const getSize = (): IconButtonProps['size'] => {
    if (
      buttonType === 'play' ||
      buttonType === 'next' ||
      buttonType === 'previous'
    )
      return 'lg';
    return 'sm';
  };

  const getSx = () => {
    if (buttonType === 'play') {
      return { borderRadius: '50%', width: 48, height: 48 };
    }
    return {};
  };

  const getColor = (): IconButtonProps['color'] => {
    if (buttonType === 'play') return 'primary';
    return 'neutral';
  };

  return (
    <IconButton
      variant={getVariant()}
      size={getSize()}
      sx={getSx()}
      color={getColor()}
      {...props}
    >
      <Icon />
    </IconButton>
  );
};
