import $ from 'jquery'
import { getColumnSizes } from 'fragmentarium/ui/fragment/PdfExportTableLayout'
import {
  createContainer,
  createPdfDoc,
} from 'fragmentarium/ui/fragment/PdfExport.testSupport'

it('sizes columns relative to the rendered table width', () => {
  jest.spyOn($.fn, 'outerWidth').mockImplementation(function (
    this: JQuery,
  ): number {
    return this.is('tbody') ? 200 : 50
  })
  const container = createContainer()
  const table = $(
    '<table><tbody><tr><td>1.</td><td>a</td><td>b</td></tr></tbody></table>',
  ).appendTo(container)

  const columnSizes = getColumnSizes(table, container, 17, 10, createPdfDoc())

  ;[
    [17, 27],
    [27, 71],
    [71, 115],
  ].forEach(([startpos, endpos], column) => {
    expect(columnSizes[column].startpos).toBeCloseTo(startpos, 2)
    expect(columnSizes[column].endpos).toBeCloseTo(endpos, 2)
  })
  expect(container.attr('style')).not.toContain('1000px')
})
