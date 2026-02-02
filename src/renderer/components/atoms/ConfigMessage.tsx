import { Alert } from '@mui/joy';

interface ConfigMessageProps {
  type: 'success' | 'error';
  text: string;
}

export const ConfigMessage = ({ type, text }: ConfigMessageProps) => (
  <Alert
    color={type === 'success' ? 'success' : 'danger'}
    sx={{ mb: 3 }}
    variant="soft"
  >
    {text}
  </Alert>
);
