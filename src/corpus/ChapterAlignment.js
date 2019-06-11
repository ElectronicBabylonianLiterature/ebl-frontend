// @flow
import React, { Fragment } from 'react'
import type { Chapter, ManuscriptLine } from './text'
import { Badge, Table } from 'react-bootstrap'

type Props = { chapter: Chapter }

function getSiglum(chapter: Chapter, manuscriptLine: ManuscriptLine) {
  const manuscript = chapter.manuscripts.find(
    candidate => candidate.id === manuscriptLine.manuscriptId
  )
  if (manuscript) {
    return manuscript.siglum
  } else {
    return `<unknown ID: ${manuscriptLine.manuscriptId}>`
  }
}

function Line({ line, chapter }) {
  const reconstruction = line.reconstruction.split(' ')
  const breaks = []
  let breakNumber = 0
  reconstruction.forEach((token, index) => {
    if (['|', '||', '(|)', '(||)'].includes(token)) {
      breaks.push(index - breakNumber)
      ++breakNumber
    }
  })
  return (
    <Table size="sm" responsive>
      <thead>
        <tr>
          <th>{line.number}</th>
          <th />
          <th />
          {reconstruction.map((token, index) => (
            <th key={index}>{token}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {line.manuscripts.map((manuscript, index) => (
          <tr key={index}>
            <td />
            <td>{getSiglum(chapter, manuscript)}</td>
            <td>
              {manuscript.labels} {manuscript.number}
            </td>
            {manuscript.atf.split(/(?!>[xX]) (?![xX])/g).map((token, index) => (
              <Fragment key={index}>
                {breaks.includes(index) && <td />}
                <td key={index}>{token}</td>
              </Fragment>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default function ChapterAlignment({ chapter }: Props) {
  return (
    <>
      <Badge variant="danger">WIP</Badge>
      {chapter.lines.map((line, index) => (
        <section key={index}>
          <Line line={line} chapter={chapter} />
        </section>
      ))}
    </>
  )
}
