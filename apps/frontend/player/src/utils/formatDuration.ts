export const formatDuration = (startedAt: string | null, completedAt: string | null): string => {
  if (!startedAt || !completedAt) {
    return '--:--';
  }

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return '--:--';
  }

  const diffMs = Math.max(0, end - start);
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
