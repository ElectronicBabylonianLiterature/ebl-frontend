import FragmentService from 'fragmentarium/application/FragmentService'

const colophonSuggestionDebounceMilliseconds = 250
const colophonSuggestionMinimumLength = 2

export type ColophonNameOption = {
  value: string
  label: string
}

export type ColophonLoadOptionsMethod = (
  inputValue: string,
  callback: (options: ColophonNameOption[]) => void,
) => Promise<void>

export const getLoadOptionsMethod = (
  fragmentService: FragmentService,
): ColophonLoadOptionsMethod => {
  const loadState = createColophonLoadState()

  return (
    inputValue: string,
    callback: (options: ColophonNameOption[]) => void,
  ): Promise<void> => {
    const normalizedInput = inputValue.trim()
    const requestId = loadState.requestSequence + 1
    loadState.requestSequence = requestId
    clearPendingColophonLoad(loadState)

    if (normalizedInput.length < colophonSuggestionMinimumLength) {
      callback([])
      return Promise.resolve()
    }

    return scheduleColophonLoad(
      fragmentService,
      loadState,
      normalizedInput,
      requestId,
      callback,
    )
  }
}

type ColophonLoadState = {
  requestSequence: number
  pendingTimeout: ReturnType<typeof setTimeout> | null
  pendingResolve: (() => void) | null
}

function createColophonLoadState(): ColophonLoadState {
  return {
    requestSequence: 0,
    pendingTimeout: null,
    pendingResolve: null,
  }
}

function clearPendingColophonLoad(loadState: ColophonLoadState): void {
  if (loadState.pendingTimeout) {
    clearTimeout(loadState.pendingTimeout)
    loadState.pendingTimeout = null
  }

  if (loadState.pendingResolve) {
    loadState.pendingResolve()
    loadState.pendingResolve = null
  }
}

function createColophonNameOptions(
  entries: readonly string[],
): ColophonNameOption[] {
  return entries.map((value) => ({
    value,
    label: value,
  }))
}

function scheduleColophonLoad(
  fragmentService: FragmentService,
  loadState: ColophonLoadState,
  normalizedInput: string,
  requestId: number,
  callback: (options: ColophonNameOption[]) => void,
): Promise<void> {
  return new Promise<void>((resolve) => {
    loadState.pendingResolve = resolve
    loadState.pendingTimeout = setTimeout(() => {
      loadState.pendingTimeout = null
      loadState.pendingResolve = null

      fragmentService
        .fetchColophonNames(normalizedInput)
        .then((entries) => {
          if (loadState.requestSequence !== requestId) {
            return
          }

          callback(createColophonNameOptions(entries))
        })
        .catch(() => {
          if (loadState.requestSequence === requestId) {
            callback([])
          }
        })
        .finally(resolve)
    }, colophonSuggestionDebounceMilliseconds)
  })
}
