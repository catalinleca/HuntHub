import styled from 'styled-components';
import { Stack, Container as MuiContainer, IconButton } from '@mui/material';

export const Wrapper = styled(Stack)`
  align-items: center;
  background: ${({ theme }) => theme.palette.background.defaultLight};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const InnerWrapper = styled(MuiContainer).attrs({ maxWidth: 'md' })`
  display: flex;
  align-items: flex-start;
`;

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

export const Connector = styled('div')`
  flex-shrink: 0;
  position: relative;
  width: 28px;
  border-top: 2px dashed ${({ theme }) => theme.palette.divider};
  align-self: center;

  &::after {
    content: '';
    position: absolute;
    right: -1px;
    top: -5px;
    border-left: 6px solid ${({ theme }) => theme.palette.divider};
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  }
`;
