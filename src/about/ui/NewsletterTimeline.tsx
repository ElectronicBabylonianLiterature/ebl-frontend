import React, { useRef, useEffect } from 'react'
import './NewsletterTimeline.sass'

interface Newsletter {
  readonly content: string
  readonly date: Date
  readonly number: number
}

interface NewsletterTimelineProps {
  newsletters: readonly Newsletter[]
  activeNewsletter: Newsletter
  onSelectNewsletter: (newsletter: Newsletter) => void
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function NewsletterTimeline({
  newsletters,
  activeNewsletter,
  onSelectNewsletter,
}: NewsletterTimelineProps): JSX.Element {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current) {
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
      activeRef.current.scrollIntoView({
        behavior,
        block: 'nearest',
      })
    }
  }, [activeNewsletter.number])

  return (
    <div className="newsletter-timeline-sidebar">
      <div className="newsletter-timeline-sidebar__header">
        <h3 className="newsletter-timeline-sidebar__title">
          Newsletter Archive
        </h3>
        <p className="newsletter-timeline-sidebar__count">
          {newsletters.length} editions
        </p>
      </div>
      <div className="newsletter-timeline-sidebar__tree">
        {newsletters.map((newsletter) => {
          const isActive = newsletter.number === activeNewsletter.number
          return (
            <button
              key={newsletter.number}
              ref={isActive ? activeRef : null}
              className={`newsletter-tree-item ${
                isActive ? 'newsletter-tree-item--active' : ''
              }`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelectNewsletter(newsletter)}
            >
              <div className="newsletter-tree-item__branch">
                <div className="newsletter-tree-item__node"></div>
              </div>
              <div className="newsletter-tree-item__content">
                <div className="newsletter-tree-item__number">
                  #{newsletter.number}
                </div>
                <div className="newsletter-tree-item__date">
                  {newsletter.date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
