import styled from 'styled-components';

export const Root = styled('div')`
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
