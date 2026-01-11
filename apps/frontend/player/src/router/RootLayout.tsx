import { Outlet } from 'react-router-dom';
import * as S from './RootLayout.styles';

export const RootLayout = () => {
  return (
    <S.Container>
      <Outlet />
    </S.Container>
  );
};
