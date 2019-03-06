import React from 'react'
import { Table } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/FragmentLink'
import withData from 'http/withData'

function LatestTransliterations ({ data }) {
  return (<>
    <h3>Latest additions:</h3>
    <Table responsive>
      <thead>
        <tr>
          <th>Number</th>
          <th>Accession</th>
          <th>Script</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map(fragment =>
          <tr key={fragment._id}>
            <td><FragmentLink number={fragment._id}>{fragment._id}</FragmentLink></td>
            <td>{fragment.accession}</td>
            <td>{fragment.script}</td>
            <td>{fragment.description}</td>
          </tr>
        )}
      </tbody>
    </Table>
  </>)
}

export default withData(
  LatestTransliterations,
  props => props.fragmentService.fetchLatestTransliterations()
)
