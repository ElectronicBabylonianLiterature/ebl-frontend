import React from 'react'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Text } from 'corpus/domain/text'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'

import './TextView.sass'
import { ChapterId } from 'corpus/application/TextService'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import CollapsibleSection from 'corpus/ui/CollapsibleSection'
import Introduction from './Introduction'
import ChapterSiglumsAndTransliterations from './ChapterSiglumsAndTransliterations'
import Chapters from './Chapters'

function TextView({
  text,
  textService,
}: {
  text: Text
  textService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Corpus'), new CorpusTextCrumb(text)]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadTexts() ? (
            <>
              <Introduction text={text} />
              <CollapsibleSection heading="Chapters" open>
                <Chapters text={text} textService={textService} />
              </CollapsibleSection>
              <CollapsibleSection heading="Colophons">
                {text.chapters.map((chapter, index) => (
                  <ChapterSiglumsAndTransliterations
                    key={index}
                    id={ChapterId.fromText(text, chapter)}
                    textService={textService}
                    method="findColophons"
                  />
                ))}
              </CollapsibleSection>
              <CollapsibleSection heading="Unplaced Lines">
                {text.chapters.map((chapter, index) => (
                  <ChapterSiglumsAndTransliterations
                    key={index}
                    id={ChapterId.fromText(text, chapter)}
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
      find(genre: string, category: string, index: string): Promise<Text>
    }
  },
  {
    genre: string
    category: string
    index: string
  },
  Text
>(
  ({ data, textService }) => <TextView text={data} textService={textService} />,
  ({ genre, category, index, textService }) =>
    textService.find(genre, category, index)
)
