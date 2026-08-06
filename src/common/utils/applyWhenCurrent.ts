import { StalenessCheck } from 'common/utils/SupersedableOperation'

export interface CurrentResultHandlers<Result> {
  onSuccess: (result: Result) => void
  onError: (error: Error) => void
}

export default function applyWhenCurrent<Result>(
  operation: () => Promise<Result>,
  { onSuccess, onError }: CurrentResultHandlers<Result>,
): (isStale: StalenessCheck) => Promise<void> {
  return (isStale: StalenessCheck): Promise<void> =>
    operation().then(
      (result: Result) => {
        if (!isStale()) {
          onSuccess(result)
        }
      },
      (error: unknown) => {
        if (!isStale()) {
          onError(error as Error)
        }
      },
    )
}
