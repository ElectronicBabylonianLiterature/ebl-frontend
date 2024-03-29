import usePromiseEffect from './usePromiseEffect'
import React, { FunctionComponent } from 'react'
import { render } from '@testing-library/react'
import Promise from 'bluebird'
import _ from 'lodash'

test('Cancels the promise on unmount', async () => {
  const promise = new Promise(_.noop)
  const TestComponent: FunctionComponent = () => {
    const [setPromise] = usePromiseEffect()
    setPromise(promise)
    return <>Test</>
  }
  const { unmount } = render(<TestComponent />)
  unmount()
  expect((await promise.reflect()).isCancelled()).toBe(true)
})

test('Cancels the promise when cancelPromise is called', async () => {
  const promise = new Promise(_.noop)
  const TestComponent: FunctionComponent = () => {
    const [setPromise, cancelPromise] = usePromiseEffect()
    setPromise(promise)
    cancelPromise()
    return <>Test</>
  }
  render(<TestComponent />)
  expect((await promise.reflect()).isCancelled()).toBe(true)
})
