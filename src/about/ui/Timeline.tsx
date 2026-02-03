import React, { useEffect, useRef, useState } from 'react'
import './Timeline.sass'

export interface TimelineItem {
  id: string
  date: string
  title: string
  content: React.ReactElement
  image?: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps): JSX.Element {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set(prev).add(entry.target.id))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    )

    const items = document.querySelectorAll('.timeline-item')
    items.forEach((item) => {
      if (observerRef.current) {
        observerRef.current.observe(item)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [items])

  return (
    <div className="timeline">
      <div className="timeline-line"></div>
      {items.map((item, index) => {
        const isLeft = index % 2 === 0
        const isVisible = visibleItems.has(item.id)
        const positionClass = isLeft
          ? 'timeline-item--left'
          : 'timeline-item--right'
        const visibilityClass = isVisible ? 'timeline-item--visible' : ''

        return (
          <div
            key={item.id}
            id={item.id}
            className={`timeline-item ${positionClass} ${visibilityClass}`}
          >
            <div className="timeline-marker">
              <div className="timeline-marker__dot"></div>
              <div className="timeline-marker__ring"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-content__header">
                <h3 className="timeline-content__date">{item.date}</h3>
                <h4 className="timeline-content__title">{item.title}</h4>
              </div>
              <div className="timeline-content__body">{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
