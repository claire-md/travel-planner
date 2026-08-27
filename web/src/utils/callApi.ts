export default async function callApi(
  path: string,
  method: string,
  body?: unknown,
) {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Prefer the API's own message. Fall back to the status text for responses
    // that aren't the JSON error envelope, such as a proxy or gateway failure.
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.message || response.statusText || "Something went wrong",
    );
  }

  return await response.json();
}
