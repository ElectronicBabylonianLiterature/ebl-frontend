import React from 'react'

const updatePropNames = [
  'updateEdition',
  'updateAnnotation',
  'updateReferences',
  'updateArchaeology',
  'updateColophon',
  'updateScopes',
]

export function SaveTriggerMock(props: Record<string, unknown>): JSX.Element {
  const updateName = updatePropNames.find(
    (name) => typeof props[name] === 'function',
  )
  const update = updateName
    ? (props[updateName] as (value: unknown) => unknown)
    : undefined
  const searchBibliography = props.searchBibliography as
    | ((query: string) => unknown)
    | undefined

  return (
    <>
      <button onClick={() => update?.([])}>Trigger save</button>
      {searchBibliography && (
        <button onClick={() => searchBibliography('query')}>
          Trigger search
        </button>
      )}
    </>
  )
}

export default SaveTriggerMock
