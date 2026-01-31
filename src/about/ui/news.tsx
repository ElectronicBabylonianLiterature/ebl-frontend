import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import newsletter20 from 'about/ui/newsletter/020.md'
import newsletter19 from 'about/ui/newsletter/019.md'
import newsletter18 from 'about/ui/newsletter/018.md'
import newsletter17 from 'about/ui/newsletter/017.md'
import newsletter16 from 'about/ui/newsletter/016.md'
import newsletter15 from 'about/ui/newsletter/015.md'
import newsletter14 from 'about/ui/newsletter/014.md'
import newsletter13 from 'about/ui/newsletter/013.md'
import newsletter12 from 'about/ui/newsletter/012.md'
import newsletter11 from 'about/ui/newsletter/011.md'
import newsletter10 from 'about/ui/newsletter/010.md'
import newsletter9 from 'about/ui/newsletter/009.md'
import newsletter8 from 'about/ui/newsletter/008.md'
import newsletter7 from 'about/ui/newsletter/007.md'
import newsletter6 from 'about/ui/newsletter/006.md'
import newsletter5 from 'about/ui/newsletter/005.md'
import newsletter4 from 'about/ui/newsletter/004.md'
import newsletter3 from 'about/ui/newsletter/003.md'
import newsletter2 from 'about/ui/newsletter/002.md'
import newsletter1 from 'about/ui/newsletter/001.md'
import { Nav, Container, Row, Col } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { History } from 'history'

interface Newsletter {
  readonly content: string
  readonly date: Date
  readonly number: number
}

export const newsletters: readonly Newsletter[] = [
  { content: newsletter20, date: new Date('09/10/2025'), number: 20 },
  { content: newsletter19, date: new Date('04/04/2025'), number: 19 },
  { content: newsletter18, date: new Date('01/08/2025'), number: 18 },
  { content: newsletter17, date: new Date('08/07/2024'), number: 17 },
  { content: newsletter16, date: new Date('05/14/2024'), number: 16 },
  { content: newsletter15, date: new Date('02/04/2024'), number: 15 },
  { content: newsletter14, date: new Date('11/06/2023'), number: 14 },
  { content: newsletter13, date: new Date('06/21/2023'), number: 13 },
  { content: newsletter12, date: new Date('02/23/2023'), number: 12 },
  { content: newsletter11, date: new Date('10/28/2022'), number: 11 },
  { content: newsletter10, date: new Date('10/10/2022'), number: 10 },
  { content: newsletter9, date: new Date('07/25/2022'), number: 9 },
  { content: newsletter8, date: new Date('06/09/2022'), number: 8 },
  { content: newsletter7, date: new Date('03/01/2022'), number: 7 },
  { content: newsletter6, date: new Date('10/14/2021'), number: 6 },
  { content: newsletter5, date: new Date('07/09/2021'), number: 5 },
  { content: newsletter4, date: new Date('06/08/2021'), number: 4 },
  { content: newsletter3, date: new Date('04/07/2021'), number: 3 },
  { content: newsletter2, date: new Date('02/05/2021'), number: 2 },
  { content: newsletter1, date: new Date('09/28/2020'), number: 1 },
]

const message = `**Get the most out of eBL!**  
We will be hosting regular Zoom sessions to showcase its features and tools. 
These sessions will include a Q&A – please feel free to submit questions in 
advance per [e-mail](mailto:${process.env.REACT_APP_INFO_EMAIL}).
The third session is scheduled for April 25th at 6:00 PM CET.
If you would like to attend, please register at the
[link](https://lmu-munich.zoom-x.de/meeting/register/hdYUYZ7-TJeVml8Ge5MZdA).
`

const newsUrl = '/about/news/'

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
              history.push(`${newsUrl}${newsletter.number}`)
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

const onHistoryChange = ({
  activeNewsletter,
  setActiveNewsletter,
  history,
}: {
  activeNewsletter: Newsletter
  setActiveNewsletter: React.Dispatch<React.SetStateAction<Newsletter>>
  history: History
}): void => {
  if (history.action === 'POP') {
    const newsletterNumber = parseInt(
      history.location.pathname.split('/').pop() ?? '',
    )
    if (newsletterNumber !== activeNewsletter.number) {
      setActiveNewsletter(getActiveNewsletter(newsletterNumber))
    }
  }
}

function getActiveNewsletter(activeNewsletterNumber?: number): Newsletter {
  let newsletter: Newsletter | undefined
  if (activeNewsletterNumber) {
    newsletter = newsletters.find(
      (newsletter) => newsletter.number === activeNewsletterNumber,
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
    getActiveNewsletter(activeNewsletterNumber),
  )
  const history = useHistory()
  useEffect(
    () => setNewsletterMarkdown(activeNewsletter.content),
    [activeNewsletter],
  )
  useEffect(
    () => () =>
      onHistoryChange({ activeNewsletter, setActiveNewsletter, history }),
  )

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
