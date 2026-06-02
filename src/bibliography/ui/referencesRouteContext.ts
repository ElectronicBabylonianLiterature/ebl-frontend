const TOOLS_REFERENCES_ROOT = '/tools/references'

export function getReferencesRouteRoot(): string {
  return TOOLS_REFERENCES_ROOT
}

export function referencesNewRoute(): string {
  return `${getReferencesRouteRoot()}/new-reference`
}

export function referencesEntryRoute(entryId: string): string {
  return `${getReferencesRouteRoot()}/${encodeURIComponent(entryId)}`
}

export function referencesEditRoute(entryId: string): string {
  return `${referencesEntryRoute(entryId)}/edit`
}
