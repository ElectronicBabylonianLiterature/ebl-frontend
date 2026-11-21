import { useMemo, useRef, useState } from 'react'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { createEditLiteActions } from 'corpus/ui/edit-lite/editLiteActions'
import {
  EditLiteActions,
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import {
  createEditLiteState,
  editLiteReducer,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'

export { lineNotReturnedMessage } from 'corpus/ui/edit-lite/lineLoading'

export interface EditLite {
  readonly state: EditLiteState
  readonly context: EditLiteContextValue
}

export default function useEditLite(
  source: ChapterEditSource,
  outline: ChapterOutline,
  canWrite: boolean,
): EditLite {
  const [state, setState] = useState<EditLiteState>(() =>
    createEditLiteState(outline),
  )
  const stateRef = useRef<EditLiteState>(state)
  const sourceRef = useRef<ChapterEditSource>(source)
  sourceRef.current = source

  const [actions] = useState<EditLiteActions>(() =>
    createEditLiteActions({
      getState: (): EditLiteState => stateRef.current,
      getSource: (): ChapterEditSource => sourceRef.current,
      dispatch: (action: EditLiteAction): void => {
        stateRef.current = editLiteReducer(stateRef.current, action)
        setState(stateRef.current)
      },
    }),
  )

  const manuscripts = state.outline.manuscripts
  const context = useMemo<EditLiteContextValue>(
    () => ({
      kind: source.kind,
      canSave: source.canSave && canWrite,
      canWrite,
      manuscripts,
      actions,
      describeChange: (change) => source.describeChange(change),
    }),
    [source, canWrite, manuscripts, actions],
  )

  return { state, context }
}
