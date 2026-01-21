import DossierRecord from './DossierRecord'

export interface DossierSearchResult {
  totalCount: number
  dossiers: readonly DossierRecord[]
}
