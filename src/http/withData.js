/* global AbortController */
import React, { Component } from 'react'
import _ from 'lodash'
import Spinner from 'Spinner'
import ErrorAlert from 'ErrorAlert'
import ErrorBoundary from 'ErrorBoundary'

const defaultConfig = {
  shouldUpdate: () => false,
  authorize: true,
  filter: () => true,
  defaultData: null,
  method: 'fetchJson'
}
export default function withData (WrappedComponent, getPath, config = {}) {
  const fullConfig = {
    ...defaultConfig,
    ...config
  }
  return class extends Component {
    abortController = new AbortController()

    state = {
      data: null,
      error: null
    }

    fetchData = () => {
      if (fullConfig.filter(this.props)) {
        this.setState({ data: null, error: null })
        this.props.apiClient[fullConfig.method](getPath(this.props), fullConfig.authorize, this.abortController.signal)
          .then(json => this.setState({ data: json, error: null }))
          .catch(error => {
            if (this.props.apiClient.isNotAbortError(error)) {
              this.setState({ data: null, error: error })
            }
          })
      } else {
        this.setState({ data: fullConfig.defaultData, error: null })
      }
    }

    componentDidMount () {
      this.fetchData()
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
      if (fullConfig.shouldUpdate(prevProps, this.props)) {
        this.fetchData()
      }
    }

    componentWillUnmount () {
      this.abortController.abort()
    }

    render () {
      return (
        <ErrorBoundary>
          <Spinner loading={_.values(this.state).every(_.isNil)} />
          <ErrorAlert error={this.state.error} />
          {this.state.data && <WrappedComponent data={this.state.data} reload={this.fetchData} {...this.props} />}
        </ErrorBoundary>
      )
    }
  }
}
