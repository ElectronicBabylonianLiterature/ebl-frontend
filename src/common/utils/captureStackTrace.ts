export type ConstructorReference = { readonly name: string }

export default function captureStackTrace(
  error: Error,
  constructorReference: ConstructorReference,
): void {
  const capture: unknown = Reflect.get(Error, 'captureStackTrace')

  if (typeof capture === 'function') {
    capture.call(Error, error, constructorReference)
  } else {
    error.stack = new Error(error.message).stack
  }
}
