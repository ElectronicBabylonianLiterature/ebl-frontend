/* global AbortController */
import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'react-bootstrap'
import _ from 'lodash'

import Spinner from 'Spinner'
import Error from 'Error'

class FragmentSearch extends Component {
  abortController = new AbortController()

  state = {
    fragments: null,
    error: null
  }

  get isLoading () {
    return _.isNil(this.state.error) && _.isNil(this.state.fragments)
  }

  fetchFragments () {
    if (_.isEmpty(this.props.number)) {
      this.setState({fragments: [], error: null})
    } else {
      const path = `/fragments?number=${encodeURIComponent(this.props.number)}`
      this.setState({fragments: null, error: null})
      this.props.apiClient
        .fetchJson(path, true, this.abortController.signal)
        .then(fragments => this.setState({fragments: fragments, error: null}))
        .catch(error => {
          if (error.name !== 'AbortError') {
            this.setState({fragments: [], error: error})
          }
        })
    }
  }

  componentDidMount () {
    this.fetchFragments()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.number !== this.props.number) {
      this.fetchFragments()
    }
  }

  componentWillUnmount () {
    this.abortController.abort()
  }

  table = () => (
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
        {this.state.fragments.map(fragment =>
          <tr key={fragment._id}>
            <td><Link to={`/fragmentarium/${fragment._id}`}>{fragment._id}</Link></td>
            <td>{fragment.accession}</td>
            <td>{fragment.cdliNumber}</td>
            <td>{fragment.description}</td>
          </tr>
        )}
        {_.isEmpty(this.state.fragments) && <tr><td colSpan={4}>No fragments found.</td></tr>}
      </tbody>
    </Table>
  )

  render () {
    return this.isLoading
      ? <Spinner />
      : (
        <Fragment>
          {this.props.number && _.isArray(this.state.fragments) &&
            <this.table />
          }
          <Error error={this.state.error} />
        </Fragment>
      )
  }
}

export default FragmentSearch
