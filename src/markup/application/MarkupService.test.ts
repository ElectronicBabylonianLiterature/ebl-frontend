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
    Bluebird.resolve(markupDtoSerialized)
  ),
]

describe('MarkupService', () => {
  beforeEach(() => {
    spy = jest
      .spyOn(
        MarkupService.prototype as MarkupService,
        'injectReferencesToMarkup'
      )
      .mockImplementation(() => Bluebird.resolve(markupDtoSerialized))
  })
  afterEach(() => {
    spy.mockClear()
  })
  testDelegation(markupService, testData)
})
