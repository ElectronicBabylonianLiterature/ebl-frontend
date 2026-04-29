import React from 'react'
import classNames from 'classnames'
import { OverlayTrigger, Popover, Table } from 'react-bootstrap'
import 'chronology/ui/DateEditor/DateSelectionInput.sass'

const patterns: ReadonlyArray<{ pattern: string; explanation: string }> = [
  { pattern: 'n', explanation: 'a number (e.g. 12)' },
  { pattern: 'x', explanation: 'unclear number' },
  { pattern: 'n+', explanation: 'number with plus (e.g. 12+)' },
  { pattern: 'x+n', explanation: 'x plus number (e.g. x+12)' },
  { pattern: 'n-n', explanation: 'number range (e.g. 12-13)' },
  { pattern: 'n/n', explanation: 'number or number (e.g. 12/13)' },
  {
    pattern: 'n[a-z]',
    explanation: 'number with letter (e.g. 12a, 12b; for year variants)',
  },
]

const popover = (
  <Popover id="date-field-patterns-help" title="Allowed Patterns">
    <Popover.Body>
      <Table size="sm" borderless className="mb-0">
        <tbody>
          {patterns.map(({ pattern, explanation }) => (
            <tr key={pattern}>
              <th scope="row">
                <code>{pattern}</code>
              </th>
              <td>{explanation}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Popover.Body>
  </Popover>
)

export default function DateFieldPatternsHelp({
  className,
}: {
  className?: string
}): JSX.Element {
  return (
    <OverlayTrigger placement="right" overlay={popover}>
      <button
        type="button"
        aria-label="Allowed date field patterns"
        className={classNames(
          className,
          'btn',
          'btn-link',
          'p-0',
          'border-0',
          'align-baseline',
          'date-field-patterns-help__button',
        )}
      >
        <i className="fas fa-info-circle" aria-hidden="true" />
      </button>
    </OverlayTrigger>
  )
}
