import { Input, IconButton } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { SxProps } from '@mui/joy/styles/types';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sx?: SxProps;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  sx,
}: SearchInputProps) => (
  <Input
    size="sm"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    startDecorator={<SearchIcon />}
    endDecorator={
      value && (
        <IconButton
          variant="plain"
          color="neutral"
          onClick={() => onChange('')}
          size="sm"
        >
          <CloseRoundedIcon />
        </IconButton>
      )
    }
    sx={{ width: 300, ...sx }}
  />
);
