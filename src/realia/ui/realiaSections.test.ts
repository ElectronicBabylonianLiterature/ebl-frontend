import {
  afoVolumeId,
  buildRealiaNav,
  realiaSectionIds,
  rlaArticleId,
} from 'realia/ui/realiaSections'
import {
  getRealiaCrossReferences,
  groupAfoRegisterByVolume,
} from 'realia/domain/RealiaEntry'
import {
  afoRegisterEntryFactory,
  realiaCrossReferenceFactory,
  realiaEntryFactory,
  reallexikonEntryFactory,
} from 'test-support/realia-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'

describe('buildRealiaNav', () => {
  it('builds a section for each present part with RlA article and AfO volume subsections', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [
        reallexikonEntryFactory.build({ title: 'Aššur A. Stadt' }),
        reallexikonEntryFactory.build({ title: 'Aššur C. Hauptgott' }),
      ],
      afoRegister: [
        afoRegisterEntryFactory.build({ AfO: 'AfO 25 (1974-1977), 370' }),
      ],
      references: [referenceFactory.build()],
      crossReferences: [realiaCrossReferenceFactory.build()],
      afoCrossReferences: [],
    })
    const volumeGroups = [
      ...groupAfoRegisterByVolume(entry.afoRegister),
    ].reverse()
    const crossReferences = getRealiaCrossReferences(entry)

    const sections = buildRealiaNav({ entry, volumeGroups, crossReferences })

    expect(sections.map((section) => section.id)).toEqual([
      realiaSectionIds.reallexikon,
      realiaSectionIds.afoRegister,
      realiaSectionIds.references,
      realiaSectionIds.seeAlso,
    ])
    const reallexikonSection = sections.find(
      (section) => section.id === realiaSectionIds.reallexikon,
    )
    expect(reallexikonSection?.subsections).toEqual([
      { id: rlaArticleId(0), label: 'Aššur A. Stadt' },
      { id: rlaArticleId(1), label: 'Aššur C. Hauptgott' },
    ])
    const afoSection = sections.find(
      (section) => section.id === realiaSectionIds.afoRegister,
    )
    expect(afoSection?.subsections).toEqual([
      { id: afoVolumeId(0), label: 'AfO 25 (1974-1977)' },
    ])
  })

  it('omits sections that have no content', () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [],
      references: [],
      crossReferences: [],
      afoCrossReferences: [],
    })

    expect(
      buildRealiaNav({ entry, volumeGroups: [], crossReferences: [] }),
    ).toEqual([])
  })
})
