export const unsavedChangesMessage =
  'You have unsaved changes. Are you sure you want to leave?'

export function handleBeforeUnload(
  event: BeforeUnloadEvent,
  hasChanges: () => boolean,
): string | void {
  if (hasChanges()) {
    event.returnValue = unsavedChangesMessage
    return unsavedChangesMessage
  }
}

export function runBeforeUnloadEvent({
  hasChanges,
}: {
  hasChanges: () => boolean
}): () => void {
  const listener = (event: BeforeUnloadEvent): string | void =>
    handleBeforeUnload(event, hasChanges)
  if (hasChanges()) {
    window.addEventListener('beforeunload', listener)
  } else {
    window.removeEventListener('beforeunload', listener)
  }
  return (): void => {
    window.removeEventListener('beforeunload', listener)
  }
}
