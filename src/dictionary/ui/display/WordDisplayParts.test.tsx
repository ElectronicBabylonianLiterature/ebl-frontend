import React from 'react'
import { render } from '@testing-library/react'
import { JoinMarkdown, OtherForm } from 'dictionary/ui/display/WordDisplayParts'

test.each([
  [true, /^before ?lemma after more$/],
  [false, /^before ?lemma\* after more$/],
])('OtherForm attested %s', (attested, text) => {
  const { container } = render(
    <OtherForm
      attested={attested}
      lemma={['lemma']}
      notes={['before', 'after', 'more']}
    />,
  )

  expect(container).toHaveTextContent(text)
})

test('JoinMarkdown separates all but the last element', () => {
  const { container } = render(
    <JoinMarkdown separator="|" listOfMarkdown={['a', 'b', 'c']} />,
  )

  expect(container).toHaveTextContent(/^a\|b\|c$/)
})
