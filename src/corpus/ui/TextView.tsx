import React from 'react'
import AppContent from 'common/ui/AppContent'
import { SectionCrumb } from 'common/ui/Breadcrumbs'
import { createChapterId, Text } from 'corpus/domain/text'
import { TextId } from 'transliteration/domain/text-id'
import withData from 'http/withData'
import CorpusTextCrumb from 'corpus/ui/CorpusTextCrumb'

import 'corpus/ui/TextView.sass'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import Introduction from 'corpus/ui/Introduction'
import ChapterSiglumsAndTransliterations from 'corpus/ui/ChapterSiglumsAndTransliterations'
import Chapters from 'corpus/ui/Chapters'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import { HeadTags } from 'router/head'
import TextService from 'corpus/application/TextService'
import FragmentService from 'fragmentarium/application/FragmentService'

function TextView({
  text,
  textService,
  fragmentService,
}: {
  text: Text
  textService: TextService
  fragmentService: FragmentService
}): JSX.Element {
  return (
    <div className="text-view ebl-consistent-links">
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
    </div>
  )
}

function TextViewWrapper({
  text,
  textService,
  fragmentService,
}: {
  text: Text
  textService: TextService
  fragmentService: FragmentService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(text.genre),
        CorpusTextCrumb.ofText(text),
      ]}
      breadcrumbsFullWidth={false}
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
    textService: TextService
    fragmentService: FragmentService
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
  ({ id, textService }, signal) => textService.find(id, signal),
)
