import $ from 'jquery'
import { IRunOptions } from 'docx'
import { getTextRun } from 'common/utils/HtmlToWord'

const mockTextRun = jest.fn<void, [IRunOptions]>()

jest.mock('docx', () => ({
  ...jest.requireActual('docx'),
  TextRun: function TextRun(options: IRunOptions) {
    mockTextRun(options)
  },
}))

beforeEach(() => mockTextRun.mockClear())

it('keeps plain text at the regular size without color or spacing', () => {
  getTextRun($('<span>kur</span>'))

  expect(mockTextRun).toHaveBeenCalledWith(
    expect.objectContaining({
      text: 'kur',
      color: undefined,
      size: 24,
      characterSpacing: undefined,
      smallCaps: false,
    }),
  )
})

it('carries color, small caps and letter spacing into the run', () => {
  getTextRun(
    $(
      '<span style="color: rgb(255, 0, 0); font-variant: all-small-caps; letter-spacing: 2px">ša</span>',
    ),
  )

  expect(mockTextRun).toHaveBeenCalledWith(
    expect.objectContaining({
      text: 'ša',
      color: 'ff0000',
      size: 16,
      characterSpacing: 40,
      smallCaps: true,
    }),
  )
})
