import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/amps/PageContent'
import ExternalLink from 'common/ExternalLink'

export default function Home({
  fragmentService,
  fragmentSearchService,
  bibliographyService,
  dossiersService,
  wordService,
  fragmentQuery,
}: Pick<
  SearchFormProps,
  | 'fragmentService'
  | 'fragmentSearchService'
  | 'dossiersService'
  | 'bibliographyService'
  | 'wordService'
  | 'fragmentQuery'
>): JSX.Element {
  return (
    <PageContent title={'Introduction'} menuTitle={'Home'}>
      <p>
        The scholarly texts of ancient Mesopotamia in the first millennium BCE,
        specifically commentaries written in Akkadian on cuneiform tablets, were
        the work of priests who also performed cultic activities in the temple.
        The proposed project seeks to demonstrate how these scholarly and cultic
        activities were interrelated and how they shaped the self-identity of
        the priestly-scholarly community that was in charge of both. The project
        thus aims to bridge the gap between the study of intellectual history
        and the study of priesthood in ancient Mesopotamia, which are treated as
        two separate fields in Assyriology.
      </p>
      <p>
        The project innovatively treats Mesopotamian scholarship and
        Mesopotamian priesthood as complementary aspects of one phenomenon:
        “scholasticism.” This concept, which originally referred to the
        scholarly activities of Catholic priests in the Middle Ages, has
        recently been applied to the study of non-European communities of
        priestly scholars with great success. Using the scholastic model to
        study the priestly-scholarly community of ancient Mesopotamia will
        reveal the intricate connections between the ritual and textual
        activities of this community and illuminate the holistic and systematic
        worldview of its members.
      </p>
      <p>
        Combining traditional philology and the comparative approach, the
        project investigates how, like other scholastic communities, the
        scholar-priests of ancient Mesopotamia “internalized” the liturgical
        texts they studied and performed, how they attributed authority to these
        texts, and how their study of the liturgical corpus generated new
        exegetical texts. Key points of comparison between the scholar-priests
        of ancient Mesopotamia and various ancient and contemporary scholastic
        communities include their interest in language, textual authority,
        commentaries, and rituals. By applying the comparative method to the
        study of cuneiform tablets, the project aims to reconstruct the social,
        religious, and intellectual reality in which they were written.
      </p>
      <p>
        Search for AMPS texts below or{' '}
        <ExternalLink href={'https://amps.huji.ac.il/'}>
          click here
        </ExternalLink>{' '}
        to learn more about the project.
      </p>
      <div className={'project-page__search'}>
        <h3>Search in AMPS</h3>
        <Container>
          <SearchForm
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            dossiersService={dossiersService}
            fragmentQuery={fragmentQuery}
            project={'AMPS'}
          />
        </Container>
      </div>
      {fragmentQuery && (
        <SearchResult
          fragmentService={fragmentService}
          fragmentQuery={fragmentQuery}
          dossiersService={dossiersService}
        />
      )}
    </PageContent>
  )
}
