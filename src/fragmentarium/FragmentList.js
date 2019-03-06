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
          {_.values(columns).map((heading, index) => <th key={index}>{heading}</th>)}
        </tr>
      </thead>
      <tbody>
        {fragments.map(fragment =>
          <tr key={fragment._id}>
            <td><FragmentLink number={fragment._id}>{fragment._id}</FragmentLink></td>
            {_.keys(columns).map((property, index) => <td key={index} >{fragment[property]}</td>)}
          </tr>
        )}
        {_.isEmpty(fragments) && <tr><td colSpan={4}>No fragments found.</td></tr>}
      </tbody>
    </Table>
  )
}

export default FragmentList
