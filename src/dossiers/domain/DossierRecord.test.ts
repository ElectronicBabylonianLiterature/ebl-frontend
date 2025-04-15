import DossierRecord from 'dossiers/domain/DossierRecord'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import Reference from 'bibliography/domain/Reference'
import _kings from 'chronology/domain/Kings.json'

describe('DossierRecord', () => {
  const references = [referenceDtoFactory.build(), referenceDtoFactory.build()]
  const mockRecordDto = {
    _id: 'test',
    description: 'some description',
    isApproximateDate: true,
    yearRangeFrom: -500,
    yearRangeTo: -470,
    relatedKings: [10.2, 11],
    provenance: 'Assyria',
    script: {
      period: 'Neo-Assyrian',
      periodModifier: 'None',
      uncertain: false,
    },
    references,
  }

  describe('Constructor', () => {
    it('initialize properties correctly', () => {
      const record = new DossierRecord(mockRecordDto)
      expect(record.id).toEqual('test')
      expect(record.description).toEqual('some description')
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

  describe('toMarkdownString', () => {
    it('generate correct Markdown string', () => {
      const record = new DossierRecord(mockRecordDto)
      const markdown = record.toMarkdownString()
      const king1 = _kings.find((k) => k.orderGlobal === 10.2)
      const king2 = _kings.find((k) => k.orderGlobal === 11)
      const king1String = king1
        ? king1.date
          ? `${king1.name} (${king1.date} BCE)`
          : king1.name
        : 'Unknown King'
      const king2String = king2
        ? king2.date
          ? `${king2.name} (${king2.date} BCE)`
          : king2.name
        : 'Unknown King'

      expect(markdown).toContain('**Description**: some description')
      expect(markdown).toContain('**Date**: ca. 500 BCE - 470 BCE')
      expect(markdown).toContain(
        `**Related Kings**: ${king1String}; ${king2String}`
      )
      expect(markdown).toContain('**Provenance**: Assyria')
      expect(markdown).toContain('**Period**: Neo-Assyrian')
      expect(markdown).toContain('**Bibliography**:')
    })

    it('handle missing optional fields gracefully', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        description: undefined,
        yearRangeFrom: undefined,
        relatedKings: [],
      })
      const markdown = record.toMarkdownString()

      expect(markdown).not.toContain('**Description**')
      expect(markdown).not.toContain('**Date**')
      expect(markdown).not.toContain('**Related Kings**')
      expect(markdown).toContain('**Provenance**: Assyria')
    })
  })

  describe('Year and script formatting via toMarkdownString', () => {
    it('should format a single BCE year correctly', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        yearRangeFrom: -500,
        yearRangeTo: undefined,
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Date**: ca. 500 BCE\n')
    })

    it('format a single CE year correctly', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        yearRangeFrom: 500,
        yearRangeTo: undefined,
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Date**: ca. 500 CE\n')
    })

    it('format a BCE to CE year range correctly', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        yearRangeFrom: -500,
        yearRangeTo: 500,
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Date**: ca. 500 BCE - 500 CE')
    })

    it('format an exact date range without approximation', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        isApproximateDate: false,
        yearRangeFrom: 100,
        yearRangeTo: 200,
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Date**: 100 CE - 200 CE')
    })

    it('handle script formatting with period only', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        script: {
          period: 'Neo-Assyrian',
          periodModifier: 'None',
          uncertain: false,
        },
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Period**: Neo-Assyrian')
    })

    it('handle script formatting with period and modifier', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        script: {
          period: 'Neo-Assyrian',
          periodModifier: 'Late',
          uncertain: false,
        },
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Period**: Late Neo-Assyrian')
    })

    it('handle script formatting with uncertainty', () => {
      const record = new DossierRecord({
        ...mockRecordDto,
        script: {
          period: 'Neo-Assyrian',
          periodModifier: 'None',
          uncertain: true,
        },
      })
      const markdown = record.toMarkdownString()
      expect(markdown).toContain('**Period**: Neo-Assyrian (?)')
    })
  })
})
