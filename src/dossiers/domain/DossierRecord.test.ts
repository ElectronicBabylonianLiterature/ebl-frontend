import DossierRecord from 'dossiers/domain/DossierRecord'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import Reference from 'bibliography/domain/Reference'

describe('DossierRecord', () => {
  const references = [referenceDtoFactory.build(), referenceDtoFactory.build()]
  const mockRecordDto = {
    _id: 'test',
    description: 'some desciption',
    isApproximateDate: true,
    yearRangeFrom: -500,
    yearRangeTo: -470,
    relatedKings: [10.2, 11],
    provenance: Provenances.Assyria,
    script: {
      period: 'Neo-Assyrian',
      periodModifier: 'None',
      uncertain: false,
    },
    references,
  }

  describe('constructor', () => {
    it('should initialize properties correctly', () => {
      const record = new DossierRecord(mockRecordDto)
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
      expect(record.references).toEqual(
        references.map(
          (reference) =>
            new Reference(
              reference.type,
              reference.pages,
              reference.notes,
              reference.linesCited
            )
        )
      )
    })
  })
})
