import { Typography, Chip } from '@mui/material';
import { ArrowLeft } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import * as S from './HuntTitle.styles';

interface HuntTitleProps {
  huntName: string;
  lastUpdatedBy: string;
  hasUnsavedChanges: boolean;
}

export const HuntTitle = ({ huntName, lastUpdatedBy, hasUnsavedChanges }: HuntTitleProps) => {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.BackButton onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
      </S.BackButton>

      <S.TitleSection>
        <S.TitleRow>
          <Typography variant="h6" fontWeight={600}>
            {huntName}
          </Typography>
          {hasUnsavedChanges && (
            <Chip label="Unsaved changes" size="small" color="warning" variant="outlined" />
          )}
        </S.TitleRow>
        <Typography variant="caption" color="text.secondary">
          Last updated by {lastUpdatedBy}
        </Typography>
      </S.TitleSection>
    </S.Container>
  );
};
