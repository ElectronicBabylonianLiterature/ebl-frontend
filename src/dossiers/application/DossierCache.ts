import DossierRecord from 'dossiers/domain/DossierRecord'
import { CacheEntry, getCachedValue, setCachedValue } from 'common/utils/cache'

export const cacheEntryLifetimeInMilliseconds = 5 * 60 * 1000
export const defaultMaximumCachedDossiers = 250
export const defaultCacheScope = 'default'

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
    setCachedValue({
      cache: this.cachedDossiersById,
      key: record.id,
      value: record,
      maximumCacheSize: this.maximumCachedDossiers,
      cacheEntryLifetimeInMilliseconds,
      getCurrentTime: this.getCurrentTime,
    })
  }

  hasFresh(id: string): boolean {
    return this.read(id) !== null
  }

  read(id: string): DossierRecord | null {
    return getCachedValue(this.cachedDossiersById, id, this.getCurrentTime)
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
}
