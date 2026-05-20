const TOOLS_REFERENCES_ROOT = '/tools/references'

export function getReferencesRouteRoot(_pathname: string): string {
  return TOOLS_REFERENCES_ROOT
}

export function referencesNewRoute(pathname: string): string {
  return `${getReferencesRouteRoot(pathname)}/new-reference`
}

export function referencesEntryRoute(
  pathname: string,
  entryId: string,
): string {
  return `${getReferencesRouteRoot(pathname)}/${encodeURIComponent(entryId)}`
}

export function referencesEditRoute(pathname: string, entryId: string): string {
  return `${referencesEntryRoute(pathname, entryId)}/edit`
}
