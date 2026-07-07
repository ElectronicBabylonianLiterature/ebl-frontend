import { Session } from 'auth/Session'
import { Crumb, SectionCrumb, TextCrumb } from 'common/ui/Breadcrumbs'

export const tabIds = [
  'date-converter',
  'list-of-kings',
  'genres',
  'dossiers',
  'signs',
  'dictionary',
  'references',
  'afo-register',
  'realia',
  'cuneiform-converter',
  'map',
] as const
export type TabId = (typeof tabIds)[number]

export type ContentLocation = {
  hash: string
  pathname: string
  search: string
}

export type ContentHistory = {
  push: (to: string) => void
}

export type ContentMatch = {
  params: Record<string, string>
  isExact: boolean
  path: string
  url: string
}

export const tabConfig = [
  { id: 'signs', title: 'Signs', icon: '𒀀' },
  { id: 'dictionary', title: 'Akkadian Dictionary', icon: 'Ꞌ' },
  { id: 'realia', title: 'Realia', icon: '⚘' },
  { id: 'date-converter', title: 'Date Converter', icon: '⇌' },
  { id: 'list-of-kings', title: 'List of Kings', icon: '♔' },
  { id: 'genres', title: 'Genres', icon: '⊕' },
  { id: 'dossiers', title: 'Dossiers', icon: '⊟' },
  { id: 'references', title: 'References', icon: '※' },
  { id: 'afo-register', title: 'AfO-Register', icon: '⊞' },
  { id: 'cuneiform-converter', title: 'Cuneiform Converter', icon: '𒐕' },
  { id: 'map', title: 'Findspot Map', icon: '◈' },
] as const

export function isTabVisible(tabId: string, session: Session): boolean {
  if (tabId === 'realia') {
    return session.isAllowedToReadRealia()
  }
  return true
}

export function getCurrentTab(selectedTab?: TabId) {
  return tabConfig.find((tab) => tab.id === selectedTab)
}

export function getDisplayTitle(selectedTab?: TabId): string {
  if (!selectedTab) {
    return 'Tools'
  }

  return getCurrentTab(selectedTab)?.title ?? 'Tools'
}

export function getToolsBreadcrumbs(
  displayTitle: string,
  selectedTab?: TabId,
): Crumb[] {
  if (!selectedTab) {
    return [new SectionCrumb('Tools')]
  }

  return [new SectionCrumb('Tools'), new TextCrumb(displayTitle)]
}
