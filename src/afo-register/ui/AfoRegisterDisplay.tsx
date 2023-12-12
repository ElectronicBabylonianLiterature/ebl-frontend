import React from 'react'
import AfoRegisterRecord from 'afo-register/domain/Record'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'

export function AfoRegisterRecordDisplay({
  record,
  index,
}: {
  record: AfoRegisterRecord
  index: string | number
}): JSX.Element {
  return (
    <MarkdownAndHtmlToHtml
      key={`md-${index}`}
      markdownAndHtml={record.toMarkdownString()}
      className="afo-register-record"
    />
  )
}

export function AfoRegisterRecordsListDisplay({
  records,
  ...props
}: {
  records: readonly AfoRegisterRecord[]
} & React.OlHTMLAttributes<HTMLOListElement>): JSX.Element {
  if (records.length < 1) {
    return <p>No records found</p>
  }
  return (
    <ol {...props}>
      {records.map((record, index) => (
        <li key={`li-${index}`} className="afo-register-records__list-item">
          <AfoRegisterRecordDisplay record={record} index={index} />
        </li>
      ))}
    </ol>
  )
}
