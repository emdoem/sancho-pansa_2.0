import { Input } from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search tracks...',
}: SearchInputProps) => (
  <Input
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    startDecorator={<SearchIcon />}
    sx={{ width: 300 }}
  />
);
