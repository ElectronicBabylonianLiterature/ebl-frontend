import React, { useState } from 'react'
import { Chapter, Line, ManuscriptLine } from 'corpus/domain/text'
import { Badge, Button, Col, Form } from 'react-bootstrap'
import Promise from 'bluebird'
import produce, { castDraft, Draft } from 'immer'
import WordLemmatizer from 'fragmentarium/ui/lemmatization/WordLemmatizer'
import {
  UniqueLemma,
  LemmatizationToken,
} from 'transliteration/domain/Lemmatization'
import Reconstruction from 'corpus/ui/Reconstruction'
import FragmentService from 'fragmentarium/application/FragmentService'
import Lemma from 'transliteration/domain/Lemma'
import Word from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import withData from 'http/withData'

interface Props {
  fragmentService: FragmentService
  chapter: Chapter
  line: Line
  manuscriptLine: ManuscriptLine
  onChange: (line: ManuscriptLine) => void
}

function ManuscriptLineLemmatization(
  props: Props & { data: readonly LemmatizationToken[] }
) {
  const [lemmatization, setLemmatization] = useState(props.data)
  const handleChange = (index: number) => (uniqueLemma: UniqueLemma) => {
    const newToken = lemmatization[index].setUniqueLemma(uniqueLemma)
    setLemmatization(
      produce(lemmatization, (draft) => {
        draft[index] = castDraft(newToken)
      })
    )
    props.onChange(
      produce(props.manuscriptLine, (draft: Draft<ManuscriptLine>) => {
        draft.atfTokens[index].uniqueLemma = uniqueLemma.map(
          (lemma) => lemma.value
        )
      })
    )
  }
  return (
    <Form.Row>
      <Col md={1} />
      <Col md={1}>{props.chapter.getSiglum(props.manuscriptLine)}</Col>
      <Col md={1}>
        {props.manuscriptLine.labels} {props.manuscriptLine.number}
      </Col>
      <Col md={9}>
        {lemmatization.map((token, index) => (
          <span key={index}>
            {token.lemmatizable ? (
              <WordLemmatizer
                fragmentService={props.fragmentService}
                token={token}
                onChange={handleChange(index)}
              />
            ) : (
              token.value
            )}{' '}
          </span>
        ))}
      </Col>
    </Form.Row>
  )
}

const ManuscriptLineLemmatizationWithData = withData<
  Props,
  { wordService: WordService },
  readonly LemmatizationToken[]
>(ManuscriptLineLemmatization, (props) =>
  Promise.all(
    props.manuscriptLine.atfTokens.map((token) =>
      Promise.all(
        token.uniqueLemma?.map((value) =>
          props.wordService.find(value).then((word: Word) => new Lemma(word))
        ) ?? []
      ).then(
        (lemmas) =>
          new LemmatizationToken(
            token.value,
            token.lemmatizable ?? false,
            lemmas
          )
      )
    )
  )
)

export default function ChapterLemmatization({
  fragmentService,
  wordService,
  chapter,
  onChange,
  onSave,
  disabled,
}: {
  fragmentService: FragmentService
  wordService: WordService
  chapter: Chapter
  onChange: (chapter: Chapter) => void
  onSave: () => void
  disabled: boolean
}): JSX.Element {
  const handleChange = (lineIndex: number) => (manuscriptIndex: number) => (
    manuscript: ManuscriptLine
  ) =>
    onChange(
      produce(chapter, (draft: Draft<Chapter>) => {
        draft.lines[lineIndex].manuscripts[manuscriptIndex] = castDraft(
          manuscript
        )
      })
    )
  return (
    <Form>
      <Badge variant="warning">Beta</Badge>
      <fieldset disabled={disabled}>
        {chapter.lines.map((line, lineIndex) => (
          <section key={lineIndex}>
            <Reconstruction line={line} />
            {line.manuscripts.map((manuscript, manuscriptIndex) => (
              <ManuscriptLineLemmatizationWithData
                key={manuscriptIndex}
                fragmentService={fragmentService}
                wordService={wordService}
                chapter={chapter}
                line={line}
                manuscriptLine={manuscript}
                onChange={handleChange(lineIndex)(manuscriptIndex)}
              />
            ))}
          </section>
        ))}
        <Button onClick={onSave}>Save lemmatization</Button>
      </fieldset>
    </Form>
  )
}
