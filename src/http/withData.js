/* global AbortController */
import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import Spinner from 'Spinner'
import Error from 'Error'

export default function withData (WrappedComponent, getPath, shouldUpdate = () => false) {
  return class extends Component {
    abortController = new AbortController()

    state = {
      data: null,
      error: null
    }

    fetchData () {
      this.props.apiClient
        .fetchJson(getPath(this.props), true, this.abortController.signal)
        .then(json => this.setState({data: json, error: null}))
        .catch(error => {
          if (error.name !== 'AbortError') {
            this.setState({data: null, error: error})
          }
        })
    }

    componentDidMount () {
      this.fetchData()
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
      if (shouldUpdate(prevProps, this.props)) {
        this.fetchData()
      }
    }

    componentWillUnmount () {
      this.abortController.abort()
    }

    render () {
      return (
        <Fragment>
          <Spinner loading={_.values(this.state).every(_.isNil)} />
          <Error error={this.state.error} />
          {this.state.data && <WrappedComponent data={this.state.data} {...this.props} />}
        </Fragment>
      )
    }
  }
}
