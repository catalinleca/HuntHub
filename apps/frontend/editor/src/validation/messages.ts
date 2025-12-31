export const errorMessage = (fieldName = 'Value') => ({
  required: `${fieldName} is required`,
  minCount: (count = 1) => `${fieldName} needs at least ${count} item(s)`,
});
