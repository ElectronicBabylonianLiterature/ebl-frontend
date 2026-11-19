import React, { useId, useState } from 'react'
import { Button } from 'react-bootstrap'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/LinePager.sass'

interface Props {
  readonly pageStart: number
  readonly pageSize: number
  readonly lineCount: number
  readonly onPageStartChange: (pageStart: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onGoToLine: (lineNumber: string) => boolean
}

interface GoToLineProps {
  readonly onGoToLine: (lineNumber: string) => boolean
}

export const pageSizes: readonly number[] = [10, 25, 50]
export const defaultPageSize = 10

export function normalizePageSize(pageSize: number | undefined): number {
  return pageSize !== undefined && pageSizes.includes(pageSize)
    ? pageSize
    : defaultPageSize
}

export function formatLineRange(
  pageStart: number,
  pageSize: number,
  lineCount: number,
): string {
  const first = pageStart + 1
  const last = Math.min(pageStart + pageSize, lineCount)
  if (lineCount === 0) {
    return 'No lines'
  }
  return first === last
    ? `Line ${first} of ${lineCount}`
    : `Lines ${first}–${last} of ${lineCount}`
}

function GoToLine({ onGoToLine }: GoToLineProps): JSX.Element {
  const id = useId()
  const [lineNumber, setLineNumber] = useState<string>('')
  const [missingLineNumber, setMissingLineNumber] = useState<string | null>(
    null,
  )
  const isMissing = missingLineNumber !== null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const requestedLineNumber = lineNumber.trim()
    const isFound =
      requestedLineNumber === '' || onGoToLine(requestedLineNumber)
    setMissingLineNumber(isFound ? null : requestedLineNumber)
  }

  return (
    <form className="edit-lite-pager__group" onSubmit={handleSubmit}>
      <label className="edit-lite-label" htmlFor={`${id}-number`}>
        Go to line
      </label>
      <input
        id={`${id}-number`}
        className="edit-lite-input edit-lite-pager__number"
        type="text"
        autoComplete="off"
        placeholder="e.g. 12a"
        value={lineNumber}
        aria-invalid={isMissing}
        aria-describedby={isMissing ? `${id}-message` : undefined}
        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
          setLineNumber(event.target.value)
          setMissingLineNumber(null)
        }}
      />
      <Button type="submit" size="sm" variant="outline-secondary">
        Go
      </Button>
      {isMissing && (
        <span
          id={`${id}-message`}
          className="edit-lite-pager__message"
          role="alert"
        >
          Line {missingLineNumber} was not found.
        </span>
      )}
    </form>
  )
}

function LinePager({
  pageStart,
  pageSize,
  lineCount,
  onPageStartChange,
  onPageSizeChange,
  onGoToLine,
}: Props): JSX.Element {
  const sizeId = useId()

  return (
    <nav className="edit-lite-pager" aria-label="Line pages">
      <div className="edit-lite-pager__group">
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={pageStart <= 0}
          onClick={(): void => onPageStartChange(pageStart - pageSize)}
        >
          Previous
        </Button>
        <span className="edit-lite-pager__indicator" aria-live="polite">
          {formatLineRange(pageStart, pageSize, lineCount)}
        </span>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={pageStart + pageSize >= lineCount}
          onClick={(): void => onPageStartChange(pageStart + pageSize)}
        >
          Next
        </Button>
      </div>
      <div className="edit-lite-pager__group">
        <label className="edit-lite-label" htmlFor={sizeId}>
          Lines per page
        </label>
        <select
          id={sizeId}
          className="edit-lite-input edit-lite-pager__size"
          value={pageSize}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void =>
            onPageSizeChange(Number(event.target.value))
          }
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <GoToLine onGoToLine={onGoToLine} />
    </nav>
  )
}

export default React.memo(LinePager)
