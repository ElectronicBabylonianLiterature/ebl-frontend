import React from 'react'
import { Table } from 'react-bootstrap'
import _ from 'lodash'
import FragmentLink from 'fragmentarium/FragmentLink'

function FragmentList ({ fragments }) {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Number</th>
          <th>Accession</th>
          <th>CDLI Number</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {fragments.map(fragment =>
          <tr key={fragment._id}>
            <td><FragmentLink number={fragment._id}>{fragment._id}</FragmentLink></td>
            <td>{fragment.accession}</td>
            <td>{fragment.cdliNumber}</td>
            <td>{fragment.description}</td>
          </tr>
        )}
        {_.isEmpty(fragments) && <tr><td colSpan={4}>No fragments found.</td></tr>}
      </tbody>
    </Table>
  )
}

export default FragmentList
