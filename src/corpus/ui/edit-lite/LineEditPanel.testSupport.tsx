import React, { useState } from 'react'
import { screen, within } from '@testing-library/react'
import { Line } from 'corpus/domain/line'
import {
  EditLiteRenderOptions,
  EditLiteRenderResult,
  renderWithEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import LineEditPanel from 'corpus/ui/edit-lite/LineEditPanel'

export interface RenderedPanel extends EditLiteRenderResult {
  readonly onChange: jest.Mock<void, [Line]>
  currentLine(): Line
}

interface StatefulPanelProps {
  readonly initialLine: Line
  readonly onChange: (line: Line) => void
  readonly disabled?: boolean
}

function StatefulPanel({
  initialLine,
  onChange,
  disabled,
}: StatefulPanelProps): JSX.Element {
  const [line, setLine] = useState<Line>(initialLine)
  return (
    <>
      <LineEditPanel
        line={line}
        onChange={(changedLine: Line): void => {
          setLine(changedLine)
          onChange(changedLine)
        }}
        disabled={disabled}
      />
      <button type="button" onClick={(): void => setLine(initialLine)}>
        Restore
      </button>
    </>
  )
}

export function renderPanel(
  line: Line,
  disabled?: boolean,
  options: EditLiteRenderOptions = {},
): RenderedPanel {
  const onChange = jest.fn<void, [Line]>()
  const view = renderWithEditLite(
    <StatefulPanel
      initialLine={line}
      onChange={onChange}
      disabled={disabled}
    />,
    options,
  )
  return {
    ...view,
    onChange,
    currentLine: (): Line => {
      const calls = onChange.mock.calls
      return calls.length > 0 ? calls[calls.length - 1][0] : line
    },
  }
}

export function variantGroup(variantNumber: number): HTMLElement {
  return screen.getByRole('group', { name: `Variant ${variantNumber}` })
}

export function manuscriptGroup(
  variantNumber: number,
  manuscriptNumber: number,
): HTMLElement {
  return within(variantGroup(variantNumber)).getByRole('group', {
    name: `Manuscript line ${manuscriptNumber}`,
  })
}
