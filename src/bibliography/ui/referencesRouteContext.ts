const TOOLS_REFERENCES_ROOT = '/tools/references'
const REFERENCE_LIBRARY_REFERENCES_ROOT =
  '/reference-library/bibliography/references'

function startsWithPath(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`)
}

export function getReferencesRouteRoot(pathname: string): string {
  if (startsWithPath(pathname, REFERENCE_LIBRARY_REFERENCES_ROOT)) {
    return REFERENCE_LIBRARY_REFERENCES_ROOT
  }
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
