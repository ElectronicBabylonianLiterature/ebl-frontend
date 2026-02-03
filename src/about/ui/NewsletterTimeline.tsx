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

export default function NewsletterTimeline({
  newsletters,
  activeNewsletter,
  onSelectNewsletter,
}: NewsletterTimelineProps): JSX.Element {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
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
            <div
              key={newsletter.number}
              ref={isActive ? activeRef : null}
              className={`newsletter-tree-item ${
                isActive ? 'newsletter-tree-item--active' : ''
              }`}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
