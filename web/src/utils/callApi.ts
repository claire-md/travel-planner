export default async function callApi(
  path: string,
  method: string,
  body?: any,
  errorMessage: string = "Failed to call API",
) {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return await response.json();
}
