import styled from 'styled-components';
import { Stack, IconButton } from '@mui/material';

export const Container = styled(Stack)<{ $canScrollLeft: boolean; $canScrollRight: boolean }>`
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3, 2)};
  overflow-x: auto;
  scrollbar-width: none;
  min-width: 0;
  box-shadow: ${({ theme, $canScrollLeft, $canScrollRight }) => {
    const shadows = [$canScrollLeft && theme.shadows[12], $canScrollRight && theme.shadows[13]].filter(Boolean);
    return shadows.length ? shadows.join(', ') : 'none';
  }};

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ScrollButton = styled(IconButton)<{ $visible: boolean }>`
  align-self: center;
  margin: ${({ theme }) => theme.spacing(0, 1)};
  opacity: ${({ $visible }) => ($visible ? 1 : 0.3)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
`;
