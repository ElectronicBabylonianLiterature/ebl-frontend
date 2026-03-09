import React from 'react'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { createChapterId, Text } from 'corpus/domain/text'
import { TextId } from 'transliteration/domain/text-id'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'

import './TextView.sass'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import Introduction from './Introduction'
import ChapterSiglumsAndTransliterations from './ChapterSiglumsAndTransliterations'
import Chapters from './Chapters'
import GenreCrumb from './GenreCrumb'
import { HeadTags } from 'router/head'

function TextView({
  text,
  textService,
  fragmentService,
}: {
  text: Text
  textService
  fragmentService
}): JSX.Element {
  return (
    <>
      <Introduction text={text} />
      <CollapsibleSection classNameBlock="text-view" heading="Chapters" open>
        <Chapters
          text={text}
          textService={textService}
          fragmentService={fragmentService}
        />
      </CollapsibleSection>
      <CollapsibleSection classNameBlock="text-view" heading="Colophons">
        {text.chapters.map((chapter, index) => (
          <ChapterSiglumsAndTransliterations
            key={index}
            id={createChapterId(text, chapter)}
            textService={textService}
            method="findColophons"
          />
        ))}
      </CollapsibleSection>
      <CollapsibleSection classNameBlock="text-view" heading="Unplaced Lines">
        {text.chapters.map((chapter, index) => (
          <ChapterSiglumsAndTransliterations
            key={index}
            id={createChapterId(text, chapter)}
            textService={textService}
            method="findUnplacedLines"
          />
        ))}
      </CollapsibleSection>
    </>
  )
}

function TextViewWrapper({
  text,
  textService,
  fragmentService,
}: {
  text: Text
  textService
  fragmentService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(text.genre),
        CorpusTextCrumb.ofText(text),
      ]}
    >
      <HeadTags
        title={`${text.name}: Text edition in the electronic Babylonian Library`}
        description={`Edition of ${text.name} in the electronic Babylonian Library (eBL) Corpus. ${text.intro}`}
      />
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadTexts() ? (
            <TextView
              text={text}
              textService={textService}
              fragmentService={fragmentService}
            />
          ) : (
            <p>Please log in to view the text.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default withData<
  {
    textService: {
      find(id: TextId): Promise<Text>
    }
    fragmentService
  },
  {
    id: TextId
  },
  Text
>(
  ({ data, textService, fragmentService }) => (
    <TextViewWrapper
      text={data}
      textService={textService}
      fragmentService={fragmentService}
    />
  ),
  ({ id, textService }) => textService.find(id),
)
