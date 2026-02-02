import { testDelegation, TestData } from 'test-support/utils'
import Bluebird from 'bluebird'
import { stringify } from 'query-string'

import MarkupService from 'markup/application/MarkupService'
import ApiClient from 'http/ApiClient'
import BibliographyService from 'bibliography/application/BibliographyService'
import { markupString, markupDtoSerialized } from 'test-support/markup-fixtures'

jest.mock('http/ApiClient')
jest.mock('transliteration/application/ReferenceInjector')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>
const bibliographyServiceMock = new MockBibliographyService()
const markupService = new MarkupService(apiClient, bibliographyServiceMock)

let spy

const testData: TestData<MarkupService>[] = [
  new TestData(
    'fromString',
    [markupString],
    apiClient.fetchJson,
    markupDtoSerialized,
    [
      `/markup?${stringify({
        text: markupString,
      })}`,
      false,
    ],
    Bluebird.resolve(markupDtoSerialized),
  ),
]

describe('MarkupService: fromString', () => {
  beforeEach(() => {
    spy = jest
      .spyOn(
        MarkupService.prototype as MarkupService,
        'injectReferencesToMarkup',
      )
      .mockImplementation(() => Bluebird.resolve(markupDtoSerialized))
  })
  afterEach(() => {
    spy.mockClear()
  })
  testDelegation(markupService, testData)
})

it('MarkupService: toString', () => {
  expect(markupService.toString(markupDtoSerialized)).toEqual(
    'This tablet is a one columned chronicle-fragment, telling about the faulty reignship of king Šulgi, who committed sins against Babylon and Uruk. The text is written in an accusatory tone, stressed by the repetition of exclamatory sentences about Šulgis sinfull deeds. It was discussed in lenghth by   , who pointed out its inspiration trough the Sumerian Kinglist as well as anachronistic allusions to Nabonid. The tablet is part of a series, as can be seen from the existence of the catchline and a “specular catchline” as it is called by Hunger, ( SpTU  1, 20 n. 2), that seems to resume the content of the preceding chapter. About one half or even two thirds of the composition is missing. This is underlined by the colophon, that takes almost all of the space on the reverse but in many other cases covers only about a third and occasionally half of a tablet. The tablet stems from the 27. campaign in Uruk 1969 of the residential area U XVIII and was published first by Hunger 1976 in SpTU 1, 2.',
  )
})
