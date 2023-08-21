import { Provenance } from 'corpus/domain/provenance'
import MuseumNumber from './MuseumNumber'

export class Archaeology {
  readonly excavationNumber: MuseumNumber
  readonly site: Provenance

  constructor(excavationNumber: MuseumNumber, site: Provenance) {
    this.excavationNumber = excavationNumber
    this.site = site
  }
}
