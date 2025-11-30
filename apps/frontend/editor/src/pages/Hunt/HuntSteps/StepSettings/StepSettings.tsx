import { useFormContext, useWatch } from 'react-hook-form';
import { Collapse, Stack, Typography } from '@mui/material';
import { MapPinIcon, LightbulbIcon, TimerIcon, RepeatIcon } from '@phosphor-icons/react';
import {
  enableLocation,
  disableLocation,
  enableHint,
  disableHint,
  enableTimeLimit,
  disableTimeLimit,
  enableMaxAttempts,
  disableMaxAttempts,
  isLocationEnabled,
  isHintEnabled,
  isTimeLimitEnabled,
  isMaxAttemptsEnabled,
} from '@/utils/stepSettings';
import { useSettingVisibility } from './useSettingVisibility';
import { SettingToggleButton } from './components';
import { LocationSection, HintSection, TimeLimitSection, MaxAttemptsSection } from './sections';
import * as S from './StepSettings.styles';

interface StepSettingsProps {
  stepIndex: number;
}

export const StepSettings = ({ stepIndex }: StepSettingsProps) => {
  const { setValue } = useFormContext();
  const basePath = `hunt.steps.${stepIndex}`;

  const [location, hint, timeLimit, maxAttempts] = useWatch({
    name: [`${basePath}.requiredLocation`, `${basePath}.hint`, `${basePath}.timeLimit`, `${basePath}.maxAttempts`],
  });

  const locationEnabled = isLocationEnabled(location);
  const hintEnabled = isHintEnabled(hint);
  const timeLimitEnabled = isTimeLimitEnabled(timeLimit);
  const maxAttemptsEnabled = isMaxAttemptsEnabled(maxAttempts);

  const locationPath = `${basePath}.requiredLocation`;
  const hintPath = `${basePath}.hint`;
  const timeLimitPath = `${basePath}.timeLimit`;
  const maxAttemptsPath = `${basePath}.maxAttempts`;

  const locationVis = useSettingVisibility(
    locationEnabled,
    () => enableLocation(setValue, locationPath),
    () => disableLocation(setValue, locationPath),
  );

  const hintVis = useSettingVisibility(
    hintEnabled,
    () => enableHint(setValue, hintPath),
    () => disableHint(setValue, hintPath),
  );

  const timeLimitVis = useSettingVisibility(
    timeLimitEnabled,
    () => enableTimeLimit(setValue, timeLimitPath),
    () => disableTimeLimit(setValue, timeLimitPath),
  );

  const maxAttemptsVis = useSettingVisibility(
    maxAttemptsEnabled,
    () => enableMaxAttempts(setValue, maxAttemptsPath),
    () => disableMaxAttempts(setValue, maxAttemptsPath),
  );

  return (
    <Stack spacing={2}>
      <Typography variant="label" color="text.secondary">
        Step Settings
      </Typography>

      <S.ToggleButtonsRow>
        <SettingToggleButton
          enabled={locationVis.isVisible}
          onClick={locationVis.toggle}
          label="Location"
          icon={<MapPinIcon size={16} weight={locationVis.isVisible ? 'fill' : 'regular'} />}
        />
        <SettingToggleButton
          enabled={hintVis.isVisible}
          onClick={hintVis.toggle}
          label="Hint"
          icon={<LightbulbIcon size={16} weight={hintVis.isVisible ? 'fill' : 'regular'} />}
        />
        <SettingToggleButton
          enabled={timeLimitVis.isVisible}
          onClick={timeLimitVis.toggle}
          label="Time Limit"
          icon={<TimerIcon size={16} weight={timeLimitVis.isVisible ? 'fill' : 'regular'} />}
        />
        <SettingToggleButton
          enabled={maxAttemptsVis.isVisible}
          onClick={maxAttemptsVis.toggle}
          label="Attempts"
          icon={<RepeatIcon size={16} weight={maxAttemptsVis.isVisible ? 'fill' : 'regular'} />}
        />
      </S.ToggleButtonsRow>

      <Collapse in={locationVis.isVisible} onExited={locationVis.handleExited}>
        <LocationSection stepIndex={stepIndex} />
      </Collapse>

      <Collapse in={hintVis.isVisible} onExited={hintVis.handleExited}>
        <HintSection stepIndex={stepIndex} />
      </Collapse>

      <Collapse in={timeLimitVis.isVisible} onExited={timeLimitVis.handleExited}>
        <TimeLimitSection stepIndex={stepIndex} />
      </Collapse>

      <Collapse in={maxAttemptsVis.isVisible} onExited={maxAttemptsVis.handleExited}>
        <MaxAttemptsSection stepIndex={stepIndex} />
      </Collapse>
    </Stack>
  );
};
