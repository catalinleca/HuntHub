import { Typography, Link } from '@mui/material';

export const TermsFooter = () => (
  <Typography variant="xsRegular" color="text.secondary" textAlign="center">
    By continuing, you agree to our{' '}
    <Link href="#" color="text.primary" underline="always">
      Terms of Service
    </Link>
  </Typography>
);
