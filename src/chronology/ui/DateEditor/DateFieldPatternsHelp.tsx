import React from 'react'
import { Popover } from 'react-bootstrap'
import HelpTrigger from 'common/ui/HelpTrigger'

const patterns = [
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

function DateFieldPatternsHelpPopover(): JSX.Element {
  return (
    <Popover id="date-field-patterns-help" title="Allowed Patterns">
      <Popover.Body>
        <dl style={{ margin: 0 }}>
          {patterns.map(({ pattern, explanation }) => (
            <React.Fragment key={pattern}>
              <dt style={{ float: 'left', width: '30%', fontWeight: 'bold' }}>
                <code>{pattern}</code>
              </dt>
              <dd style={{ float: 'left', width: '70%', marginLeft: 0 }}>
                {explanation}
              </dd>
            </React.Fragment>
          ))}
        </dl>
        <div style={{ clear: 'both' }} />
      </Popover.Body>
    </Popover>
  )
}

export default function DateFieldPatternsHelp({
  className,
}: {
  className?: string
}) {
  return (
    <HelpTrigger
      overlay={<DateFieldPatternsHelpPopover />}
      className={className}
      data-testid="patterns-help-icon"
    />
  )
}
