import React, { PropsWithChildren } from 'react'
import _ from 'lodash'
import withData from 'http/withData'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import classnames from 'classnames'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { isTextLine } from 'transliteration/domain/type-guards'
import { parallelLinePrefix } from 'transliteration/domain/parallel-line'
import ManuscriptPopOver from './ManuscriptPopover'
import { LineGroup } from 'transliteration/ui/LineGroup'
import { LemmaPopover } from 'transliteration/ui/WordInfo'
import { Token } from 'transliteration/domain/token'

function Manuscript({
  manuscript,
  lineGroup,
}: {
  manuscript: ManuscriptLineDisplay
  lineGroup: LineGroup
}): JSX.Element {
  const ManuscriptTokenPopover = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return (
      <LemmaPopover token={token} lineGroup={lineGroup}>
        {children}
      </LemmaPopover>
    )
  }
  function highlightAlignedTokens(token: Token): string[] {
    return token.alignment && lineGroup.highlightIndex === token.alignment
      ? ['highlight']
      : []
  }

  return (
    <tr
      className={classnames({
        'chapter-display__manuscript': true,
        'chapter-display__manuscript--standard': manuscript.isStandardText,
      })}
    >
      <td>
        <span className="chapter-display__manuscript-siglum">
          {manuscript.isParallelText && parallelLinePrefix}
          <ManuscriptPopOver manuscript={manuscript} />
        </span>
      </td>
      <td>
        <span className="chapter-display__manuscript-labels">
          {manuscript.labels.join(' ')}{' '}
          {manuscript.number !== null &&
            `${lineNumberToString(manuscript.number)}.`}
        </span>
      </td>
      {isTextLine(manuscript.line) ? (
        <LineColumns
          columns={manuscript.line.columns}
          maxColumns={lineGroup.numberOfColumns}
          TokenActionWrapper={ManuscriptTokenPopover}
          conditionalBemModifiers={highlightAlignedTokens}
        />
      ) : (
        <td colSpan={lineGroup.numberOfColumns}></td>
      )}
      <td>
        <span className="chapter-display__manuscript-paratext">
          {manuscript.dollarLines
            .map((dollarLine) => dollarLine.displayValue)
            .join(' ')}
        </span>
      </td>
      <td>
        {manuscript.hasNotes && (
          <OverlayTrigger
            rootClose
            overlay={
              <Popover
                id={_.uniqueId('ManuscriptLineNotesPopOver-')}
                className=""
              >
                <Popover.Content>
                  <ol className="chapter-display__manuscript-notes">
                    {manuscript.noteLines.map((note, index) => (
                      <Markup key={index} container="li" parts={note.parts} />
                    ))}
                  </ol>
                </Popover.Content>
              </Popover>
            }
            trigger={['click']}
            placement="top"
          >
            <i className="fas fa-book chapter-display__manuscript-info-toggle"></i>
          </OverlayTrigger>
        )}
      </td>
    </tr>
  )
}

const Score = withData<
  { lineGroup: LineGroup },
  { lineGroup: LineGroup },
  LineDetails
>(
  ({ data: line, lineGroup }): JSX.Element => {
    if (lineGroup.lineDetails === null) {
      lineGroup.setLineDetails(line)
    }

    return (
      <table className="chapter-display__manuscripts">
        <tbody>
          {lineGroup.manuscripts.map((manuscript, index) => (
            <Manuscript
              manuscript={manuscript}
              key={index}
              lineGroup={lineGroup}
            />
          ))}
        </tbody>
      </table>
    )
  },
  ({ lineGroup }) => lineGroup.findChapterLine(),
  {
    filter: (props) => !props.lineGroup.hasManuscriptLines,
    defaultData: (props) => props.lineGroup.lineDetails,
  }
)

export default Score
