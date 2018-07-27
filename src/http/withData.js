/* global AbortController */
import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import Spinner from 'Spinner'
import Error from 'Error'

export default function withData (WrappedComponent, getPath, shouldUpdate = () => false, authorize = true, filter = () => true, defaultData = null, method = 'fetchJson') {
  return class extends Component {
    abortController = new AbortController()

    state = {
      data: null,
      error: null
    }

    fetchData = () => {
      if (filter(this.props)) {
        this.setState({data: null, error: null})
        this.props.apiClient[method](getPath(this.props), authorize, this.abortController.signal)
          .then(json => this.setState({data: json, error: null}))
          .catch(error => {
            if (error.name !== 'AbortError') {
              this.setState({data: null, error: error})
            }
          })
      } else {
        this.setState({data: defaultData, error: null})
      }
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
          {this.state.data && <WrappedComponent data={this.state.data} reload={this.fetchData} {...this.props} />}
        </Fragment>
      )
    }
  }
}
