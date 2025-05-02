import classNames from 'classnames'
import React from 'react'

export default function TransliterationTd({
  type,
  children,
  ...props
}: {
  type: string
} & React.TdHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return (
    <td
      {...props}
      // eslint-disable-next-line react/prop-types
      className={classNames(`Transliteration__${type}`, props.className)}
    >
      {children}
    </td>
  )
}
