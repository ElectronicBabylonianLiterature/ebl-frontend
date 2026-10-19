import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import withData, { Config, WithData } from 'http/withData'
import ErrorReporterContext, { ErrorReporter } from 'ErrorReporterContext'

export interface Props {
  prop: string
}

export const data = 'Test data'
export const defaultData = 'Default data'
export const newData = 'New Test Data'
export const propValue = 'passed value'
export const newPropValue = 'new value'
export const errorMessage = 'error'

export interface WithDataHarness {
  filter: jest.Mock<boolean, [Props]>
  config: Config<Props, string>
  getter: jest.Mock<Promise<string>, [Props, AbortSignal]>
  ComponentWithData: React.ComponentType<Props>
  InnerComponent: jest.Mock<JSX.Element, [WithData<Props, string>]>
  errorReportingService: ErrorReporter
}

export function createWithDataHarness(): WithDataHarness {
  const watch = (props: Props): [string] => [props.prop]
  const filter = jest.fn<boolean, [Props]>()
  filter.mockReturnValue(true)
  const getter = jest.fn<Promise<string>, [Props, AbortSignal]>()
  const InnerComponent = jest.fn<JSX.Element, [WithData<Props, string>]>()
  InnerComponent.mockImplementation((props: WithData<Props, string>) => (
    <h1>
      {props.prop} {props.data}
    </h1>
  ))
  const config: Config<Props, string> = {
    watch,
    filter,
    defaultData: () => defaultData,
  }
  return {
    filter,
    config,
    getter,
    InnerComponent,
    ComponentWithData: withData<Props, unknown, string>(
      InnerComponent,
      getter,
      config,
    ),
    errorReportingService: {
      captureException: jest.fn(),
      showReportDialog: jest.fn(),
      setUser: jest.fn(),
      clearScope: jest.fn(),
    },
  }
}

export function renderInErrorReporter(
  harness: WithDataHarness,
  element: JSX.Element,
): RenderResult {
  return render(
    <ErrorReporterContext.Provider value={harness.errorReportingService}>
      {element}
    </ErrorReporterContext.Provider>,
  )
}

export function renderWithData(harness: WithDataHarness): RenderResult {
  return renderInErrorReporter(
    harness,
    <>
      <harness.ComponentWithData prop={propValue} />{' '}
    </>,
  )
}

export function rerenderWithData(
  harness: WithDataHarness,
  rerender: RenderResult['rerender'],
  prop: string,
): void {
  rerender(
    <ErrorReporterContext.Provider value={harness.errorReportingService}>
      <>
        <harness.ComponentWithData prop={prop} />{' '}
      </>
    </ErrorReporterContext.Provider>,
  )
}
