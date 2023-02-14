import About from 'about/ui/about'
import Bluebird from 'bluebird'
import MarkupService from 'markup/application/MarkupService'
import { markupDtoSerialized } from 'test-support/markup-fixtures'

jest.mock('markup/application/MarkupService')

let mockDate: jest.SpyInstance<string, any>

beforeAll(() => {
  mockDate = jest.spyOn(Date.prototype, 'toLocaleDateString')
})

afterAll(() => {
  mockDate.mockRestore()
})

const MockMarkupService = MarkupService as jest.Mock<jest.Mocked<MarkupService>>
const markupServiceMock = new MockMarkupService()

markupServiceMock.fromString.mockReturnValue(
  Bluebird.resolve(markupDtoSerialized)
)

test('Snapshot', () => {
  mockDate.mockReturnValue('1/1/2023')
  expect(About({ markupService: markupServiceMock })).toMatchSnapshot()
})
