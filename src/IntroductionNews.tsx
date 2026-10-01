import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { newsletters } from 'about/ui/news'

const NEWSLETTER_FRONTMATTER_LINES = 4
const NEWSLETTER_PREVIEW_LINES = 3

const newsletterPreviewMarkdownComponents: React.ComponentProps<
  typeof ReactMarkdown
>['components'] = {
  a: ({ children }) => <>{children}</>,
}

export function getNewsletterPreview(content: string): string {
  const lines = content.split('\n')
  const contentLines = lines
    .slice(NEWSLETTER_FRONTMATTER_LINES)
    .filter((line) => line.trim() && !line.startsWith('#'))
  return contentLines.slice(0, NEWSLETTER_PREVIEW_LINES).join('\n')
}

export default function NewsSection(): JSX.Element {
  const latestNewsletter = newsletters[0]
  const olderNewsletters = newsletters.slice(1, 4)
  return (
    <section className="introduction-news">
      <Container>
        <div className="introduction-news__header">
          <div className="introduction-news__header-content">
            <h2 className="introduction-news__title">Latest from eBL</h2>
            <p className="introduction-news__subtitle">
              Stay updated with new features, improvements, and announcements
            </p>
          </div>
          <Link to="/about/news" className="introduction-news__view-all-btn">
            View all updates
            <span className="introduction-news__view-all-arrow">→</span>
          </Link>
        </div>

        <div className="introduction-news__featured">
          <Link
            to={`/about/news/${latestNewsletter.number}`}
            className="introduction-news__featured-card"
          >
            <div className="introduction-news__featured-badge">
              <span className="introduction-news__featured-badge-label">
                Latest
              </span>
              <span className="introduction-news__featured-badge-number">
                #{latestNewsletter.number}
              </span>
            </div>
            <div className="introduction-news__featured-content">
              <div className="introduction-news__featured-date">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {latestNewsletter.date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <h3 className="introduction-news__featured-title">
                Newsletter #{latestNewsletter.number}
              </h3>
              <div className="introduction-news__featured-preview">
                <ReactMarkdown components={newsletterPreviewMarkdownComponents}>
                  {getNewsletterPreview(latestNewsletter.content)}
                </ReactMarkdown>
              </div>
              <div className="introduction-news__featured-cta">
                Read full newsletter
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="introduction-news__recent-list">
            {olderNewsletters.map((newsletter) => (
              <Link
                key={newsletter.number}
                to={`/about/news/${newsletter.number}`}
                className="introduction-news__recent-item"
              >
                <div className="introduction-news__recent-badge">
                  #{newsletter.number}
                </div>
                <div className="introduction-news__recent-content">
                  <div className="introduction-news__recent-date">
                    {newsletter.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="introduction-news__recent-title">
                    Newsletter #{newsletter.number}
                  </div>
                </div>
                <div className="introduction-news__recent-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
