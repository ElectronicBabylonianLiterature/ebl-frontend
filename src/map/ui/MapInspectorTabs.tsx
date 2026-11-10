import React, { useRef, useState } from 'react'

export interface InspectorTab {
  readonly id: string
  readonly label: string
  readonly render: () => JSX.Element
}

interface Props {
  readonly tabs: readonly InspectorTab[]
  readonly label: string
}

const NEXT_KEYS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
}

function targetTabIndex(
  key: string,
  index: number,
  count: number,
): number | undefined {
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  const step = NEXT_KEYS[key]
  return step === undefined ? undefined : (index + step + count) % count
}

export default function MapInspectorTabs({ tabs, label }: Props): JSX.Element {
  const [activeId, setActiveId] = useState(tabs[0].id)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0]

  const move = (index: number): void => {
    const next = tabs[index]
    setActiveId(next.id)
    buttonRefs.current.get(next.id)?.focus()
  }

  return (
    <div className="map-inspector__tabs">
      <div role="tablist" aria-label={label} className="map-inspector__tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === active.id

          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) buttonRefs.current.set(tab.id, node)
              }}
              type="button"
              role="tab"
              id={`map-inspector-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={
                isActive ? `map-inspector-panel-${tab.id}` : undefined
              }
              tabIndex={isActive ? 0 : -1}
              className={`map-inspector__tab${
                isActive ? ' map-inspector__tab--active' : ''
              }`}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => {
                const target = targetTabIndex(
                  event.key,
                  tabs.findIndex((candidate) => candidate.id === active.id),
                  tabs.length,
                )
                if (target === undefined) return
                event.preventDefault()
                move(target)
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`map-inspector-panel-${active.id}`}
        aria-labelledby={`map-inspector-tab-${active.id}`}
        className="map-inspector__tabpanel"
      >
        {active.render()}
      </div>
    </div>
  )
}
