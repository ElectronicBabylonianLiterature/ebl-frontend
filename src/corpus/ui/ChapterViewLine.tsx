import React, { useState } from 'react'
import _ from 'lodash'
import { ChapterDisplay, ChapterId, LineDisplay } from 'corpus/domain/chapter'
import withData from 'http/withData'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import { TextLineColumn } from 'transliteration/domain/columns'
import classNames from 'classnames'
import TextService from 'corpus/application/TextService'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import classnames from 'classnames'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { isTextLine } from 'transliteration/domain/type-guards'

function InterText({
  line,
  colSpan,
}: {
  line: LineDisplay
  colSpan: number
}): JSX.Element {
  return (
    <>
      {line.intertext.length > 0 && (
        <tr>
          <td colSpan={colSpan} className="chapter-display__intertext">
            (<Markup container="span" parts={line.intertext} />)
          </td>
        </tr>
      )}
    </>
  )
}

function LineNumber({ line }: { line: LineDisplay }): JSX.Element {
  return (
    <td className="chapter-display__line-number">
      {lineNumberToString(line.number)}
    </td>
  )
}

function Translation({ line }: { line: LineDisplay }): JSX.Element {
  return line.translation.length > 0 ? (
    <>
      <LineNumber line={line} />
      <td className="chapter-display__translation">
        <Markup parts={line.translation} />
      </td>
    </>
  ) : (
    <td colSpan={2} />
  )
}

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
          {manuscript.isParallelText && '// '}
          {manuscript.siglum}
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
            <i className="fas fa-info-circle chapter-display__manuscript-info-toggle"></i>
          </OverlayTrigger>
        )}
      </td>
    </tr>
  )
}

const Manuscripts = withData<
  Record<string, unknown>,
  {
    id: ChapterId
    lineNumber: number
    textService: TextService
  },
  LineDetails
>(
  ({ data: line }): JSX.Element => (
    <table className="chapter-display__manuscripts">
      <tbody>
        {line.variants
          .flatMap((variant) => variant.manuscripts)
          .map((manuscript, index) => (
            <Manuscript
              manuscript={manuscript}
              key={index}
              maxColumns={line.numberOfColumns}
            />
          ))}
      </tbody>
    </table>
  ),
  ({ id, lineNumber, textService }) =>
    textService.findChapterLine(id, lineNumber)
)

export function ChapterViewLine({
  chapter,
  lineNumber,
  line,
  columns,
  maxColumns,
  textService,
}: {
  chapter: ChapterDisplay
  lineNumber: number
  line: LineDisplay
  columns: readonly TextLineColumn[]
  maxColumns: number
  textService: TextService
}): JSX.Element {
  const [showManuscripts, setShowManuscripts] = useState(false)
  return (
    <>
      <InterText line={line} colSpan={maxColumns + 3} />
      <tr
        onClick={() => setShowManuscripts(!showManuscripts)}
        className={classNames({
          'chapter-display__line': true,
          'chapter-display__line--is-second-line-of-parallelism':
            line.isSecondLineOfParallelism,
          'chapter-display__line--is-beginning-of-section':
            line.isBeginningOfSection,
        })}
      >
        <td className="chapter-display__line-toggle">
          <i
            className={classNames({
              fas: true,
              'fa-caret-right': !showManuscripts,
              'fa-caret-down': showManuscripts,
            })}
            aria-expanded={showManuscripts}
          ></i>
        </td>
        <LineNumber line={line} />
        <LineColumns columns={columns} maxColumns={maxColumns} />
        <Translation line={line} />
      </tr>
      {showManuscripts && (
        <tr>
          <td colSpan={maxColumns + 3}>
            <Manuscripts
              id={chapter.id}
              lineNumber={lineNumber}
              textService={textService}
            />
          </td>
        </tr>
      )}
    </>
  )
}
