import { useEffect, useRef, useState } from 'react'
import SupersedableOperation from 'common/utils/SupersedableOperation'
import SerialQueue from 'common/utils/SerialQueue'
import { Fragment } from 'fragmentarium/domain/fragment'

type FragmentSave = () => Promise<Fragment>

export interface FragmentSaves {
  visibleFragment: Fragment
  isCurrentFragment: boolean
  isSaving: boolean
  error: Error | null
  handleSave: (save: FragmentSave) => Promise<Fragment>
  enqueueSave: (save: FragmentSave) => Promise<Fragment>
}

export default function useFragmentSaves(fragment: Fragment): FragmentSaves {
  const [currentFragment, setFragment] = useState(fragment)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const saveOperation = useRef(new SupersedableOperation())
  const fragmentOperation = useRef(new SupersedableOperation())
  const saveQueue = useRef(new SerialQueue())

  const isCurrentFragment = currentFragment.number === fragment.number
  const visibleFragment = isCurrentFragment ? currentFragment : fragment

  useEffect(
    () => () => {
      saveOperation.current.supersede()
      fragmentOperation.current.supersede()
    },
    [],
  )

  useEffect(() => {
    if (currentFragment.number !== fragment.number) {
      saveOperation.current.supersede()
      fragmentOperation.current.supersede()
      saveQueue.current = new SerialQueue()
      setFragment(fragment)
      setError(null)
      setIsSaving(false)
    }
  }, [currentFragment.number, fragment])

  const handleSave = (save: FragmentSave): Promise<Fragment> => {
    setError(null)
    setIsSaving(true)

    const savePromise = saveQueue.current.enqueue(save)
    const isSaveStale = saveOperation.current.start()
    const isFragmentStale = fragmentOperation.current.observe()
    savePromise.then(
      (updatedFragment) => {
        if (!isSaveStale()) {
          setFragment(updatedFragment)
          setIsSaving(false)
        }
      },
      (saveError: Error) => {
        if (!isFragmentStale()) {
          setError(saveError)
        }
        if (!isSaveStale()) {
          setIsSaving(false)
        }
      },
    )
    return savePromise
  }

  return {
    visibleFragment,
    isCurrentFragment,
    isSaving,
    error,
    handleSave,
    enqueueSave: (save) => saveQueue.current.enqueue(save),
  }
}
