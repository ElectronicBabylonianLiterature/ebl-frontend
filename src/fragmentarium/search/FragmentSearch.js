import React from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'react-bootstrap'
import _ from 'lodash'

import withData from 'http/withData'

function FragmentSearch ({ number, data }) {
  return number
    ? (<Table responsive>
      <thead>
        <tr>
          <th>Number</th>
          <th>Accession</th>
          <th>CDLI Number</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map(fragment =>
          <tr key={fragment._id}>
            <td><Link to={`/fragmentarium/${fragment._id}`}>{fragment._id}</Link></td>
            <td>{fragment.accession}</td>
            <td>{fragment.cdliNumber}</td>
            <td>{fragment.description}</td>
          </tr>
        )}
        {_.isEmpty(data) && <tr><td colSpan={4}>No fragments found.</td></tr>}
      </tbody>
    </Table>)
    : null
}

export default withData(
  FragmentSearch,
  props => `/fragments?number=${encodeURIComponent(props.number)}`,
  {
    shouldUpdate: (prevProps, props) => prevProps.number !== props.number,
    filter: props => !_.isEmpty(props.number),
    defaultData: []
  }
)
