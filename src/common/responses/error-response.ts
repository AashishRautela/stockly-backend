export const ErrorResponse = (
  message = 'Something went wrong',
  error: Record<string, unknown> = {},
) => ({
  success: false,
  message,
  data: {},
  error,
});
