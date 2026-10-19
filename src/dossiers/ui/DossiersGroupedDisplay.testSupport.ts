import { referenceDtoFactory } from 'test-support/bibliography-fixtures'

export const createMockRecordDto = (
  id: string,
  description: string,
  period: string,
  periodModifier: string,
  provenance: string,
) => ({
  _id: id,
  description,
  isApproximateDate: false,
  yearRangeFrom: -500,
  yearRangeTo: -470,
  relatedKings: [],
  provenance,
  script: {
    period,
    periodModifier,
    uncertain: false,
  },
  references: referenceDtoFactory.buildList(1),
})

export const getDossierSearchLabel = (recordId: string): string =>
  `Open fragment search results for dossier ${recordId}`
