import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import {
  findNextWord,
  findPreviousWord,
} from 'corpus/application/edit-lite/annotationWords'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { AnnotationView } from 'corpus/ui/edit-lite/editLiteState'
import { useLineFlow } from 'corpus/ui/edit-lite/LineFlowContext'

export interface WordActivation {
  readonly position: number | null
  settle(): void
  request(position: number): void
}

export const idleWordActivation: WordActivation = {
  position: null,
  settle: _.noop,
  request: _.noop,
}

export interface WordFlow {
  readonly active: number | null
  activate(position: number): void
  close(): void
  suspend(): void
  next(): void
  previous(): void
}

interface Options {
  readonly index: number
  readonly view: AnnotationView
  readonly words: readonly unknown[]
  readonly isLocked: boolean
  readonly activation: WordActivation
}

export default function useWordFlow({
  index,
  view,
  words,
  isLocked,
  activation,
}: Options): WordFlow {
  const { actions, canSave } = useEditLiteContext()
  const lineFlow = useLineFlow()
  const [active, setActive] = useState<number | null>(null)
  const canActivate = !isLocked && (activation.position ?? 0) < words.length
  const close = useCallback((): void => setActive(null), [])

  useEffect(() => {
    if (activation.position !== null) {
      activation.settle()
      if (canActivate && lineFlow.isFocusHeld()) {
        setActive(activation.position)
      }
    }
  }, [activation, canActivate, lineFlow])

  const suspend = (): void => {
    lineFlow.holdFocus()
    setActive(null)
  }
  const leave = (): void => {
    suspend()
    if (canSave) {
      actions.leaveAnnotation(index, view, () => lineFlow.advance(view))
    }
  }
  const move = (find: (position: number) => number | null): void => {
    const target = find(active as number)
    if (target === null) {
      leave()
    } else {
      setActive(target)
    }
  }

  return {
    active: isLocked ? null : active,
    activate: setActive,
    close,
    suspend,
    next: (): void => move((position) => findNextWord(words.length, position)),
    previous: (): void => move(findPreviousWord),
  }
}
