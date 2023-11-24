import React from 'react'
import AfoRegisterRecord from 'afo-register/domain/Record'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'

export function AfoRegisterRecordsList({
  records,
  ...props
}: {
  records: readonly AfoRegisterRecord[]
} & React.OlHTMLAttributes<HTMLOListElement>): JSX.Element {
  return (
    <ol {...props}>
      {records.map((record, index) => (
        <li key={`li-${index}`} className="afoRegisterRecordsList__record">
          <MarkdownAndHtmlToHtml
            key={`md-${index}`}
            markdownAndHtml={record.toMarkdownString([])}
          />
        </li>
      ))}
    </ol>
  )
}
