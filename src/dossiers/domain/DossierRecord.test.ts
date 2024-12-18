import DossierRecord from 'dossiers/domain/DossierRecord'
import { ReferenceType } from 'bibliography/domain/Reference'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'

describe('DossierRecord', () => {
  const mockRecord = {
    id: 'test',
    description: 'some desciption',
    isApproximateDate: true,
    yearRangeFrom: -500,
    yearRangeTo: -470,
    relatedKings: [10.2, 11],
    provenance: Provenances.Assyria,
    script: {
      period: Periods['Neo-Assyrian'],
      periodModifier: PeriodModifiers.None,
      uncertain: false,
    },
    references: ['EDITION' as ReferenceType, 'DISCUSSION' as ReferenceType],
  }

  describe('constructor', () => {
    it('should initialize properties correctly', () => {
      const record = new DossierRecord(mockRecord)
      expect(record.id).toEqual('test')
      expect(record.description).toEqual('some desciption')
      expect(record.isApproximateDate).toEqual(true)
      expect(record.yearRangeFrom).toEqual(-500)
      expect(record.yearRangeTo).toEqual(-470)
      expect(record.relatedKings).toEqual([10.2, 11])
      expect(record.provenance).toEqual(Provenances.Assyria)
      expect(record.script).toEqual({
        period: Periods['Neo-Assyrian'],
        periodModifier: PeriodModifiers.None,
        uncertain: false,
      })
      expect(record.references).toEqual(['EDITION', 'DISCUSSION'])
    })
  })
})
