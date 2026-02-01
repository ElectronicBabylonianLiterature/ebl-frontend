import $ from 'jquery'

export function fixHtmlParseOrder(inputElements: JQuery<HTMLElement>): void {
  inputElements
    .find('span,em,sup')
    .filter((i, el) => {
      return $(el).children().length > 0
    })
    .contents()
    .filter((i, el) => {
      return $(el)[0].nodeType === 3
        ? $.trim($(el)[0].textContent ?? '').length > 0
        : false
    })
    .wrap('<span></span>')
}
