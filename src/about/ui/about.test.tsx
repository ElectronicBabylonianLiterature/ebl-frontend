import About from 'about/ui/about'
import Bluebird from 'bluebird'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'

jest.mock('markup/application/MarkupService')

const MockMarkupService = MarkupService as jest.Mock<jest.Mocked<MarkupService>>
const markupServiceMock = new MockMarkupService()

markupServiceMock.fromString.mockReturnValue(
  Bluebird.resolve(markupDtoSerialized)
)

test('Snapshot', () => {
  expect(About({ markupService: markupServiceMock })).toMatchSnapshot()
})
