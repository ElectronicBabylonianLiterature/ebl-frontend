import React from 'react'
import { Table } from 'react-bootstrap'
import _ from 'lodash'
import FragmentLink from 'fragmentarium/FragmentLink'

function FragmentList ({ fragments, columns }) {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Number</th>
          {_.keys(columns).map((heading, index) => <th key={index}>{heading}</th>)}
        </tr>
      </thead>
      <tbody>
        {fragments.map(fragment =>
          <tr key={fragment.number}>
            <td><FragmentLink number={fragment.number}>{fragment.number}</FragmentLink></td>
            {_.values(columns).map((property, index) => <td key={index} >{_.isFunction(property)
              ? property(fragment)
              : fragment[property]
            }</td>)}
          </tr>
        )}
        {_.isEmpty(fragments) && <tr><td colSpan={4}>No fragments found.</td></tr>}
      </tbody>
    </Table>
  )
}

export default FragmentList
