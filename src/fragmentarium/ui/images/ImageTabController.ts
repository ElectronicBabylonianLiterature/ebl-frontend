import _ from 'lodash'
import {
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab,
} from 'fragmentarium/ui/FragmentLink'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'

export const FOLIO = 'folio'
export const PHOTO = 'photo'
export const CDLI = 'cdli'

export type NamedImageTab = typeof PHOTO | typeof CDLI

export interface VisitedImageTabs {
  readonly namedTabs: ReadonlySet<NamedImageTab>
  readonly folioIndexes: ReadonlySet<number>
}

const folioKeyPattern = /^\d+$/

export function parseFolioIndex(key: string): number | null {
  return folioKeyPattern.test(key) ? Number(key) : null
}

export function isNamedImageTab(key: string): key is NamedImageTab {
  return key === PHOTO || key === CDLI
}

export function folioTabKey(index: number): string {
  return String(index)
}

export function visitImageTab(
  visited: VisitedImageTabs,
  key: string | undefined,
): VisitedImageTabs {
  if (key === undefined) {
    return visited
  }
  const folioIndex = parseFolioIndex(key)
  if (folioIndex !== null && !visited.folioIndexes.has(folioIndex)) {
    return {
      ...visited,
      folioIndexes: new Set([...visited.folioIndexes, folioIndex]),
    }
  }
  if (isNamedImageTab(key) && !visited.namedTabs.has(key)) {
    return { ...visited, namedTabs: new Set([...visited.namedTabs, key]) }
  }
  return visited
}

export function hasUsableCdliTab(fragment: Fragment): boolean {
  return (fragment.cdliImages?.length ?? 0) > 0
}

export class TabController {
  readonly fragment: Fragment
  readonly tab: string | null
  readonly activeFolio: Folio | null
  readonly navigate: (url: string) => void

  constructor(
    fragment: Fragment,
    tab: string | null,
    activeFolio: Folio | null,
    navigate: (url: string) => void,
  ) {
    this.fragment = fragment
    this.tab = tab
    this.activeFolio = activeFolio
    this.navigate = navigate
  }

  get defaultKey(): string | undefined {
    return _([
      this.fragment.hasPhoto && PHOTO,
      ...this.fragment.folios.map((folio, index) => folioTabKey(index)),
      hasUsableCdliTab(this.fragment) && CDLI,
    ])
      .compact()
      .head()
  }

  get activeKey(): string | undefined {
    if (this.tab === FOLIO) {
      const index = this.fragment.folios.findIndex(
        (folio) =>
          this.activeFolio !== null &&
          folio.name === this.activeFolio.name &&
          folio.number === this.activeFolio.number,
      )
      return index >= 0 ? folioTabKey(index) : this.defaultKey
    }

    return this.tab && this.isAvailableTab(this.tab)
      ? this.tab
      : this.defaultKey
  }

  openTab = (eventKey: string | null): void => {
    if (eventKey !== null) {
      const folioIndex = parseFolioIndex(eventKey)
      if (folioIndex !== null && this.hasFolio(folioIndex)) {
        this.openFolio(folioIndex)
      } else {
        this.navigate(createFragmentUrlWithTab(this.fragment.number, eventKey))
      }
    }
  }

  openFolio = (index: number): void => {
    this.navigate(
      createFragmentUrlWithFolio(
        this.fragment.number,
        this.fragment.folios[index],
      ),
    )
  }

  private hasFolio(index: number): boolean {
    return index < this.fragment.folios.length
  }

  private isAvailableTab(tab: string): boolean {
    const folioIndex = parseFolioIndex(tab)
    if (folioIndex !== null) {
      return this.hasFolio(folioIndex)
    }
    return (
      (tab === PHOTO && this.fragment.hasPhoto) ||
      (tab === CDLI && hasUsableCdliTab(this.fragment))
    )
  }
}
