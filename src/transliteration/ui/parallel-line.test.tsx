import React from 'react'
import { render, screen } from '@testing-library/react'
import { composition, fragment, text } from 'test-support/lines/parallel'
import { DisplayParallel } from './parallel-line'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'

test('parallel fragment', () => {
  render(<DisplayParallel line={fragment} />)

  const museumNumber = museumNumberToString(fragment.museumNumber)
  const hash = lineNumberToAtf(fragment.lineNumber)
  const content = `F ${museumNumber} ${lineNumberToString(fragment.lineNumber)}`

  expect(screen.getByRole('link', { name: content })).toHaveAttribute(
    'href',
    `/fragmentarium/${encodeURIComponent(museumNumber)}#${encodeURIComponent(
      hash
    )}`
  )
})

test('parallel text', () => {
  render(<DisplayParallel line={text} />)

  const hash = lineNumberToAtf(text.lineNumber)
  const content = `cf. L I.1 OB II ${lineNumberToString(text.lineNumber)}`

  expect(screen.getByRole('link', { name: content })).toHaveAttribute(
    'href',
    `/corpus/L/1/1/${encodeURIComponent(
      text.chapter?.stage ?? ''
    )}/${encodeURIComponent(text.chapter?.name ?? '')}#${encodeURIComponent(
      hash
    )}`
  )
})

test('parallel composition', () => {
  render(<DisplayParallel line={composition} />)

  const content = `(${composition.name} ${lineNumberToString(
    composition.lineNumber
  )})`

  expect(screen.getByText(content)).not.toHaveAttribute('href')
})
