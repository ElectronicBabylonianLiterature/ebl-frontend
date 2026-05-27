export default function withSearchAndHash(
  pathname: string,
  search: string,
  hash: string,
): string {
  return `${pathname}${search}${hash}`
}
