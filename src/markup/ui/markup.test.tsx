import { createParagraphs } from 'markup/ui/markup'
import { MarkupPart } from 'transliteration/domain/markup'

it('splits markup into paragraphs at each paragraph part', () => {
  const first: MarkupPart = { type: 'StringPart', text: 'first' }
  const second: MarkupPart = { type: 'StringPart', text: 'second' }

  expect(
    createParagraphs([first, { type: 'ParagraphPart', text: '' }, second]),
  ).toEqual([[{ ...first, paragraph: 0 }], [{ ...second, paragraph: 1 }]])
})
