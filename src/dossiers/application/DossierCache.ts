import DossierRecord from 'dossiers/domain/DossierRecord'

export const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
export const defaultMaximumCachedDossiers = 250
export const defaultCacheScope = 'default'

type CacheEntry<Value> = {
  readonly value: Value
  readonly expiresAt: number
}

export default class DossierCache {
  private readonly cachedDossiersById = new Map<
    string,
    CacheEntry<DossierRecord>
  >()

  constructor(
    private readonly getCurrentTime: () => number,
    private readonly maximumCachedDossiers: number,
  ) {}

  set(record: DossierRecord): void {
    this.cachedDossiersById.delete(record.id)
    this.cachedDossiersById.set(record.id, {
      value: record,
      expiresAt: this.getCurrentTime() + cacheEntryLifetimeInMilliseconds,
    })
    this.trim()
  }

  hasFresh(id: string): boolean {
    return this.read(id) !== null
  }

  read(id: string): DossierRecord | null {
    const cacheEntry = this.cachedDossiersById.get(id)

    if (!cacheEntry) {
      return null
    }

    if (cacheEntry.expiresAt <= this.getCurrentTime()) {
      this.cachedDossiersById.delete(id)
      return null
    }

    this.cachedDossiersById.delete(id)
    this.cachedDossiersById.set(id, cacheEntry)

    return cacheEntry.value
  }

  select(ids: readonly string[]): readonly DossierRecord[] {
    return ids.flatMap((id) => {
      const record = this.read(id)
      return record ? [record] : []
    })
  }

  clear(): void {
    this.cachedDossiersById.clear()
  }

  private trim(): void {
    while (this.cachedDossiersById.size > this.maximumCachedDossiers) {
      const oldestId = this.cachedDossiersById.keys().next().value

      if (oldestId === undefined) {
        return
      }

      this.cachedDossiersById.delete(oldestId)
    }
  }
}
