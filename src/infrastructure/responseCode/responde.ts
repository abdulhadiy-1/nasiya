export function successResponse(
  data: any,
  message = 'Success',
  status_code = 200,
  meta?: any
) {
  return {
    status_code,
    message,
    data,
    meta
  };
}
