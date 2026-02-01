import React from 'react'
import { Table } from 'react-bootstrap'
import _ from 'lodash'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import './FragmentList.css'
import { FragmentInfo } from 'fragmentarium/domain/fragment'

export type Columns = Record<
  string,
  string | ((fragmentInfo: FragmentInfo) => React.ReactNode)
>

function FragmentList({
  fragments,
  columns,
}: {
  fragments: readonly FragmentInfo[]
  columns: Columns
}): JSX.Element {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Number</th>
          {_.keys(columns).map((heading, index) => (
            <th className={`FragmentList__${heading}`} key={index}>
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {fragments.map((fragment) => (
          <tr key={fragment.number}>
            <td>
              <FragmentLink number={fragment.number}>
                {fragment.number}
              </FragmentLink>
            </td>
            {_.values(columns).map((property, index) => (
              <td key={index}>
                {_.isFunction(property)
                  ? property(fragment)
                  : (() => {
                      const value = _.get(fragment, property)
                      if (React.isValidElement(value)) {
                        return value
                      }
                      return _.isNil(value) ? '' : String(value)
                    })()}
              </td>
            ))}
          </tr>
        ))}
        {_.isEmpty(fragments) && (
          <tr>
            <td colSpan={4}>No fragments found.</td>
          </tr>
        )}
      </tbody>
    </Table>
  )
}

export default FragmentList
