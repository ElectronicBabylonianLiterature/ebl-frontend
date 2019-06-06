// @flow
import React from 'react'
import type { Chapter } from './text'
import { Badge } from 'react-bootstrap'

type Props = { chapter: Chapter }
export default function ChapterAlignment ({ chapter }: Props) {
  return (
    <>
      <Badge variant='danger'>WIP</Badge>
      {chapter.lines.map(line => (
        <section>
          <header>
            {line.number} {line.reconstruction}
          </header>
          {line.manuscripts.map(manuscript => (
            <article>
              {manuscript.manuscriptId} {manuscript.labels} {manuscript.number}{' '}
              {manuscript.atf}
            </article>
          ))}
        </section>
      ))}
    </>
  )
}
