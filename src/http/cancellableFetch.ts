export default function cancellableFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, options)
}
