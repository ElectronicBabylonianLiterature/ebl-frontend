// @flow
import usePromiseEffect from './usePromiseEffect'
import React from 'react'
import { render } from '@testing-library/react'
import Promise from 'bluebird'
import _ from 'lodash'

test('Cancels the promise on unmount', () => {
  const promise = new Promise(_.noop)
  const TestComponent = () => {
    const [setPromise, cancelPromise] = usePromiseEffect()
    setPromise(promise)
    return 'Test'
  }
  const element = render(<TestComponent />)
  element.unmount()
  expect(promise.isCancelled()).toBe(true)
})

test('Cancels the promise when cancelPromise is called', () => {
  const promise = new Promise(_.noop)
  const TestComponent = () => {
    const [setPromise, cancelPromise] = usePromiseEffect()
    setPromise(promise)
    cancelPromise()
    return 'Test'
  }
  const element = render(<TestComponent />)
  expect(promise.isCancelled()).toBe(true)
})
