export interface RlaPageInfo {
  readonly volume: string
  readonly startScan: number
  readonly endScan: number
  readonly pageLabel: string
}

interface RlaIndexCell {
  readonly _?: string
}

interface RlaIndexRow {
  readonly DT_RowId?: number
  readonly [column: string]: RlaIndexCell | number | undefined
}

interface ParsedArticle {
  readonly id: string
  readonly volume: string
  readonly scan: number
  readonly pageLabel: string
}

export const RLA_INDEX_URL =
  'https://publikationen.badw.de/de/rla/index/index.json'
const RLA_IMAGE_BASE = 'https://publikationen.badw.de/de/rla/a/'
const IMAGE_CALL = /rI\(event,'[^']*\/(\d+)\.(\d+)\.jpg'/
const PAGE_LABEL = /S\.\s*(\d+[a-z]?)/i

export function rlaImageUrl(volume: string, scan: number): string {
  return `${RLA_IMAGE_BASE}${volume}.${scan}.jpg`
}

function parseArticle(row: RlaIndexRow): ParsedArticle | null {
  const id = row.DT_RowId
  const cell = row['0']
  const markup = typeof cell === 'object' ? cell._ : undefined
  if (id === undefined || !markup) {
    return null
  }
  const image = IMAGE_CALL.exec(markup)
  if (!image) {
    return null
  }
  const label = PAGE_LABEL.exec(markup)
  return {
    id: String(id),
    volume: image[1],
    scan: Number(image[2]),
    pageLabel: label ? label[1] : '',
  }
}

export function parseRlaPageIndex(
  rows: readonly RlaIndexRow[],
): Map<string, RlaPageInfo> {
  const byVolume = new Map<string, ParsedArticle[]>()
  for (const row of rows) {
    const article = parseArticle(row)
    if (article) {
      const list = byVolume.get(article.volume) ?? []
      list.push(article)
      byVolume.set(article.volume, list)
    }
  }
  const index = new Map<string, RlaPageInfo>()
  for (const articles of byVolume.values()) {
    const sorted = [...articles].sort((a, b) => a.scan - b.scan)
    sorted.forEach((article, position) => {
      const next = sorted[position + 1]
      const boundary = next ? next.scan : article.scan
      index.set(article.id, {
        volume: article.volume,
        startScan: article.scan,
        endScan: Math.max(boundary, article.scan),
        pageLabel: article.pageLabel,
      })
    })
  }
  return index
}

let cachedIndex: Promise<Map<string, RlaPageInfo>> | undefined

export function loadRlaPageIndex(): Promise<Map<string, RlaPageInfo>> {
  if (!cachedIndex) {
    cachedIndex = fetch(RLA_INDEX_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`RlA index request failed (${response.status})`)
        }
        return response.json()
      })
      .then((body: { data?: readonly RlaIndexRow[] }) =>
        parseRlaPageIndex(body.data ?? []),
      )
      .catch((error) => {
        cachedIndex = undefined
        throw error
      })
  }
  return cachedIndex
}

export function clearRlaPageIndexCache(): void {
  cachedIndex = undefined
}
