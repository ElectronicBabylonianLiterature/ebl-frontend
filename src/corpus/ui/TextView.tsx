import React from 'react'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { createChapterId, Text, TextId } from 'corpus/domain/text'
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

function TextView({
  text,
  textService,
}: {
  text: Text
  textService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(text.genre),
        CorpusTextCrumb.ofText(text),
      ]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadTexts() ? (
            <>
              <Introduction text={text} />
              <CollapsibleSection
                classNameBlock="text-view"
                heading="Chapters"
                open
              >
                <Chapters text={text} textService={textService} />
              </CollapsibleSection>
              <CollapsibleSection
                classNameBlock="text-view"
                heading="Colophons"
              >
                {text.chapters.map((chapter, index) => (
                  <ChapterSiglumsAndTransliterations
                    key={index}
                    id={createChapterId(text, chapter)}
                    textService={textService}
                    method="findColophons"
                  />
                ))}
              </CollapsibleSection>
              <CollapsibleSection
                classNameBlock="text-view"
                heading="Unplaced Lines"
              >
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
  },
  {
    id: TextId
  },
  Text
>(
  ({ data, textService }) => <TextView text={data} textService={textService} />,
  ({ id, textService }) => textService.find(id)
)
