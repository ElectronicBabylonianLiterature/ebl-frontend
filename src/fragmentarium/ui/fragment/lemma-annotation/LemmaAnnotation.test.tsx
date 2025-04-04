import React from 'react'
import { render } from '@testing-library/react'
import { Text } from 'transliteration/domain/text'
import LemmaAnnotation from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import { TextLine } from 'transliteration/domain/text-line'
import { lineNumberFactory } from 'test-support/linenumber-factory'
import { kurToken } from 'test-support/test-tokens'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'

const text = new Text({
  lines: [
    new TextLine({
      type: 'TextLine',
      lineNumber: lineNumberFactory.build({ number: 1 }),
      prefix: '',
      content: [kurToken],
    }),
  ],
})

const editableTokens = [new EditableToken(kurToken, 0, 0, 0, [])]

describe('LemmaAnnotation', () => {
  it('renders the lemmatizer component', () => {
    const { container } = render(
      <LemmaAnnotation text={text} editableTokens={editableTokens} />
    )
    expect(container).toMatchSnapshot()
  })
})
