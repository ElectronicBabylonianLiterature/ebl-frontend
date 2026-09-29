import React from 'react'
import { render, screen } from '@testing-library/react'
import { lineDisplayFactory } from 'test-support/chapter-fixtures'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import TranslationLine from 'transliteration/domain/translation-line'
import { LineVariantDisplay } from 'corpus/domain/chapter'
import {
  CollapsibleRow,
  InterText,
  Translation,
  translationColumns,
} from 'corpus/ui/ChapterViewLineRows'

const germanTranslation = 'German translation'
const intertext = 'Intertext text'
const line = lineDisplayFactory.build({
  translation: [
    new TranslationLine({
      language: 'de',
      extent: null,
      parts: [{ text: germanTranslation, type: 'StringPart' }],
      content: [],
    }),
  ],
})
const variant: LineVariantDisplay = {
  ...line.variants[0],
  intertext: [{ text: intertext, type: 'StringPart' }],
}

function renderInTable(children: JSX.Element): void {
  render(
    <table>
      <tbody>{children}</tbody>
    </table>,
  )
}

describe('InterText', () => {
  test('shows the intertext', () => {
    renderInTable(
      <InterText variant={variant} colSpan={4} hasIntertext={true} />,
    )

    expect(screen.getByText(intertext)).toBeVisible()
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '4')
  })

  test('renders nothing without intertext', () => {
    renderInTable(
      <InterText variant={variant} colSpan={4} hasIntertext={false} />,
    )

    expect(screen.queryByRole('row')).not.toBeInTheDocument()
  })
})

describe('Translation', () => {
  test('shows the translation in the selected language', () => {
    renderInTable(
      <tr>
        <Translation line={line} language="de" />
      </tr>,
    )

    expect(screen.getByText(lineNumberToString(line.number))).toBeVisible()
    expect(screen.getByText(germanTranslation)).toBeVisible()
  })

  test('renders an empty cell without a matching translation', () => {
    renderInTable(
      <tr>
        <Translation line={line} language="fr" />
      </tr>,
    )

    expect(screen.getByRole('cell')).toHaveAttribute(
      'colspan',
      String(translationColumns),
    )
    expect(screen.getByRole('cell')).toBeEmptyDOMElement()
  })
})

describe('CollapsibleRow', () => {
  test('shows the content when expanded', () => {
    renderInTable(
      <CollapsibleRow show={true} id="row-id" totalColumns={5}>
        Row content
      </CollapsibleRow>,
    )

    expect(screen.getByRole('cell', { name: 'Row content' })).toHaveAttribute(
      'colspan',
      '5',
    )
    expect(screen.getByRole('row')).toHaveAttribute('id', 'row-id')
  })

  test('does not mount the content when collapsed', () => {
    renderInTable(
      <CollapsibleRow show={false} id="row-id" totalColumns={5}>
        Row content
      </CollapsibleRow>,
    )

    expect(screen.queryByText('Row content')).not.toBeInTheDocument()
  })
})
