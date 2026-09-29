import { ErrorReporter } from 'ErrorReporterContext'
import { expectConsoleErrors } from 'setupTests'

export const reactErrorLogPattern =
  /^(Error: Uncaught \[|The above error occurred)/

export function createErrorReportingServiceMock(): jest.Mocked<ErrorReporter> {
  return {
    captureException: jest.fn(),
    showReportDialog: jest.fn(),
    setUser: jest.fn(),
    clearScope: jest.fn(),
  }
}

export function renderExpectingReactError(
  renderUi: () => void,
  expectedErrorMessage?: string,
): void {
  const consoleErrorSpy = expectConsoleErrors(reactErrorLogPattern)

  renderUi()

  expect(consoleErrorSpy).toHaveBeenCalled()
  if (expectedErrorMessage) {
    expect(
      consoleErrorSpy.mock.calls.some((call) =>
        call.some((argument) => {
          if (argument instanceof Error) {
            return argument.message.includes(expectedErrorMessage)
          }

          return (
            typeof argument === 'string' &&
            argument.includes(expectedErrorMessage)
          )
        }),
      ),
    ).toBe(true)
  }
}
