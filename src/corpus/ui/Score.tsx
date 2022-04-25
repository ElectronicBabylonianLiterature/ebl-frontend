import React from 'react'
import _ from 'lodash'
import { ChapterId } from 'transliteration/domain/chapter-id'
import withData from 'http/withData'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import TextService from 'corpus/application/TextService'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import classnames from 'classnames'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { isTextLine } from 'transliteration/domain/type-guards'
import { parallelLinePrefix } from 'transliteration/domain/parallel-line'
import ManuscriptPopOver from './manuscriptPopover'

function Manuscript({
  manuscript,
  maxColumns,
}: {
  manuscript: ManuscriptLineDisplay
  maxColumns: number
}): JSX.Element {
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
          maxColumns={maxColumns}
        />
      ) : (
        <td colSpan={maxColumns}></td>
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
  Record<string, unknown>,
  {
    id: ChapterId
    lineNumber: number
    variantNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line }): JSX.Element => {
    return (
      <table className="chapter-display__manuscripts">
        <tbody>
          {line.manuscriptsOfVariant.map((manuscript, index) => (
            <Manuscript
              manuscript={manuscript}
              key={index}
              maxColumns={line.numberOfColumns}
            />
          ))}
        </tbody>
      </table>
    )
  },
  ({ id, lineNumber, variantNumber, textService }) =>
    textService.findChapterLine(id, lineNumber, variantNumber)
)

export default Score
