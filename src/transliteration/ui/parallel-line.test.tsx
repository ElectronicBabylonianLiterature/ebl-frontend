import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as parallel from 'test-support/lines/parallel'
import { DisplayParallel } from './parallel-line'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import {
  ParallelFragment,
  ParallelText,
} from 'transliteration/domain/parallel-line'

test.each([
  [parallel.fragment, 'F X.1 1′', "1'"],
  [
    new ParallelFragment({
      ...parallel.fragment,
      hasCf: true,
      surface: {
        status: [],
        surface: 'OBVERSE',
        text: '',
        abbreviation: 'o',
      },
    }),
    'cf. F X.1 o 1′',
    "o 1'",
  ],
])('parallel fragment %#', (fragment, content, hash) => {
  render(
    <MemoryRouter>
      <DisplayParallel line={fragment} />
    </MemoryRouter>
  )

  const museumNumber = museumNumberToString(fragment.museumNumber)

  expect(screen.getByRole('link', { name: content })).toHaveAttribute(
    'href',
    `/fragmentarium/${encodeURIComponent(museumNumber)}#${encodeURIComponent(
      hash
    )}`
  )
})

test('parallel fragment without link', () => {
  const fragment = new ParallelFragment({ ...parallel.fragment, exists: false })
  render(<DisplayParallel line={fragment} />)

  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

test.each([
  [new ParallelText({ ...parallel.text, hasCf: false }), 'L I.1 OB II 2'],
  [
    new ParallelText({
      ...parallel.text,
      chapter: parallel.text.chapter && {
        ...parallel.text.chapter,
        version: 'version',
      },
    }),
    'cf. L I.1 OB version II 2',
  ],
])('parallel text %#', (text, content) => {
  const hash = lineNumberToAtf(text.lineNumber)

  render(<DisplayParallel line={text} />)

  expect(screen.getByRole('link', { name: content })).toHaveAttribute(
    'href',
    `/corpus/L/1/1/${encodeURIComponent(
      text.chapter?.stage ?? ''
    )}/${encodeURIComponent(text.chapter?.name ?? '')}#${encodeURIComponent(
      hash
    )}`
  )
})

test('parallel text without link', () => {
  const text = new ParallelText({ ...parallel.text, exists: false })
  render(<DisplayParallel line={text} />)

  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

test('parallel composition', () => {
  render(<DisplayParallel line={parallel.composition} />)

  const content = `(${parallel.composition.name} ${lineNumberToString(
    parallel.composition.lineNumber
  )})`

  expect(screen.getByText(content)).toBeVisible()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
