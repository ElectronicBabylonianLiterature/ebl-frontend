export type ConstructorReference = { readonly name: string }

type StackTraceCapturer = (
  error: Error,
  constructorReference: ConstructorReference,
) => void

export default function captureStackTrace(
  error: Error,
  constructorReference: ConstructorReference,
): void {
  const capture = (
    Error as unknown as {
      captureStackTrace?: StackTraceCapturer
    }
  ).captureStackTrace

  if (typeof capture === 'function') {
    capture(error, constructorReference)
  } else {
    error.stack = new Error(error.message).stack
  }
}
