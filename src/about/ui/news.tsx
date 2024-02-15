import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import newsletter15 from 'about/ui/newsletter/015.md'
import newsletter14 from 'about/ui/newsletter/014.md'
import { Nav, Container, Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

interface Newsletter {
  readonly content: string
  readonly date: Date
  readonly number: number
}

const newsletters: readonly Newsletter[] = [
  { content: newsletter15, date: new Date('02/04/2024'), number: 15 },
  { content: newsletter14, date: new Date('11/14/2024'), number: 14 },
]

const message = `**Get the most out of eBL!**  
We will be hosting regular Zoom sessions to showcase its features and tools. 
These sessions will include a Q&A – please feel free to submit questions in advance. The first session is scheduled 
for February 29th at 6:00 PM CET. If you would like to attend, please register at the link.
Important new developments and recently implemented features are regularly summarized in the eBL Newsletters (see below).
If you wish to receive future eBL Newsletters, send us an [e-mail](mailto:ebl-info@culture.lmu.de).
`

function NewsletterMenu({
  activeNewsletterNumber,
  setActiveNewsletter,
}: {
  activeNewsletterNumber: number
  setActiveNewsletter: React.Dispatch<React.SetStateAction<Newsletter>>
}): JSX.Element {
  const history = useHistory()
  return (
    <Nav defaultActiveKey={activeNewsletterNumber} className="flex-column">
      {newsletters.map((newsletter) => {
        const { number } = newsletter
        return (
          <Nav.Link
            onClick={(event) => {
              event.preventDefault()
              history.push(`${newsletter.number}`)
              setActiveNewsletter(newsletter)
            }}
            href={`${number}`}
            key={number}
            disabled={activeNewsletterNumber === number}
          >
            Nr. {number}
            <br />
            <span style={{ fontSize: '10pt' }}>
              {newsletter.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </Nav.Link>
        )
      })}
    </Nav>
  )
}

function getActiveNewsletter(activeNewsletterNumber?: number): Newsletter {
  let newsletter: Newsletter | undefined
  if (activeNewsletterNumber) {
    newsletter = newsletters.find(
      (newsletter) => newsletter.number === activeNewsletterNumber
    )
  }
  return newsletter ?? newsletters[0]
}

export default function AboutNews({
  activeNewsletterNumber,
}: {
  activeNewsletterNumber?: number
}): JSX.Element {
  const [newsletterMarkdown, setNewsletterMarkdown] = useState('')
  const [activeNewsletter, setActiveNewsletter] = useState(
    getActiveNewsletter(activeNewsletterNumber)
  )
  const history = useHistory()
  if (!activeNewsletterNumber) {
    history.push(`${activeNewsletter.number}`)
  }
  useEffect(() => {
    fetch(activeNewsletter.content)
      .then((result) => result.text())
      .then((text) => setNewsletterMarkdown(text))
  }, [activeNewsletter])

  return (
    <>
      <div className="border border-dark m-3 p-2">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
      <Container>
        <Row>
          <Col>
            <div className="flex-column">
              <ReactMarkdown>{newsletterMarkdown}</ReactMarkdown>
            </div>
          </Col>
          <Col sm={2}>
            <NewsletterMenu
              activeNewsletterNumber={activeNewsletter.number}
              setActiveNewsletter={setActiveNewsletter}
            />
          </Col>
        </Row>
      </Container>
    </>
  )
}
