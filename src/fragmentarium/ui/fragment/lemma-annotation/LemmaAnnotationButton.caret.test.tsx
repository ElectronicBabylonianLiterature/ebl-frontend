import React from 'react'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import { kurToken } from 'test-support/test-tokens'
import {
  getDropdownToggle,
  renderButton,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotationButton.testSupport'

jest.mock('transliteration/ui/DisplayToken', () => {
  return {
    __esModule: true,
    default: ({ token }: { token: { value: string } }) => (
      <span>{token.value}</span>
    ),
  }
})

it('relies on the split toggle caret instead of rendering a second icon', () => {
  renderButton(new EditableToken(kurToken, 0, 0, 0, []))

  expect(getDropdownToggle()).toBeEmptyDOMElement()
})
