import React from 'react'
import { render, screen } from '@testing-library/react'
import TextService from 'corpus/application/TextService'
import { LineDisplay, LineVariantDisplay } from 'corpus/domain/chapter'
import {
  chapterDisplayFactory,
  lineDisplayFactory,
} from 'test-support/chapter-fixtures'
import { Break } from 'transliteration/domain/token'
import { lineNumberToAtf } from 'transliteration/domain/lineNumberToString'
import { useVariantTransliteration } from 'corpus/ui/useVariantTransliteration'

jest.mock('corpus/application/TextService')

const breakToken: Break = {
  value: '|',
  cleanValue: '|',
  enclosureType: [],
  erasure: 'NONE',
  isUncertain: false,
  type: 'MetricalFootSeparator',
}
const hiddenBreakSelector = [
  '.Transliteration__MetricalFootSeparator--hidden',
  '.Transliteration__MetricalFootSeparator--hidden *',
].join(', ')
const chapter = chapterDisplayFactory.build()
const baseLine = lineDisplayFactory.build()
const primaryVariant: LineVariantDisplay = baseLine.variants[0]
const secondaryVariant: LineVariantDisplay = {
  ...primaryVariant,
  originalIndex: 1,
  isPrimaryVariant: false,
  reconstruction: [breakToken],
}
const labelledPrimaryVariant: LineVariantDisplay = {
  ...primaryVariant,
  originalIndex: 2,
}
const line: LineDisplay = {
  ...baseLine,
  variants: [primaryVariant, secondaryVariant],
}
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

function VariantTransliteration({
  variant,
  showMeter = false,
  expandLineLinks = false,
}: {
  variant: LineVariantDisplay
  showMeter?: boolean
  expandLineLinks?: boolean
}): JSX.Element {
  const { transliteration } = useVariantTransliteration({
    chapter,
    line,
    variant,
    maxColumns: 1,
    textService,
    activeLine: '',
    expandLineLinks,
    showOldLineNumbers: false,
    showMeter,
    showIpa: false,
  })
  return (
    <table>
      <tbody>
        <tr>{transliteration}</tr>
      </tbody>
    </table>
  )
}

test.each([
  [false, true],
  [true, false],
])('showMeter %s hides breaks: %s', (showMeter, hidden) => {
  render(
    <VariantTransliteration variant={secondaryVariant} showMeter={showMeter} />,
  )

  expect(screen.getByText(/^variant/)).toBeVisible()
  expect(screen.getByText('|')).toBeInTheDocument()
  expect(
    screen.queryAllByText('|', { selector: hiddenBreakSelector }),
  ).toHaveLength(hidden ? 1 : 0)
})

test('links the line number to the chapter when expanding line links', () => {
  render(
    <VariantTransliteration variant={primaryVariant} expandLineLinks={true} />,
  )

  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    `${chapter.url}#${encodeURIComponent(lineNumberToAtf(line.number))}`,
  )
  expect(screen.queryByText(/^variant/)).not.toBeInTheDocument()
})

test('links the line number to its anchor without expanding line links', () => {
  render(<VariantTransliteration variant={labelledPrimaryVariant} />)

  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    `#${encodeURIComponent(lineNumberToAtf(line.number))}`,
  )
  expect(screen.getByText(/^variant/)).toBeVisible()
})
