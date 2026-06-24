export const SuccessResponse = (
  message = 'Request successful',
  data: Record<string, unknown> | unknown[] = {},
) => ({
  success: true,
  message,
  data,
  error: {},
});
