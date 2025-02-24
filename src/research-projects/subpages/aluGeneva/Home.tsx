import React from 'react'
import { Container } from 'react-bootstrap'
import SearchForm, { SearchFormProps } from 'fragmentarium/ui/SearchForm'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import PageContent from 'research-projects/subpages/aluGeneva/PageContent'
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
        The editions of *Šumma ālu* presented here were prepared in the context
        of the projects “Edition of the Omen Series Šumma Alu” (2017–2021;{' '}
        <ExternalLink href={'http://p3.snf.ch/project-175970'}>
          http://p3.snf.ch/project-175970
        </ExternalLink>{' '}
        ), “Typology and potential of the excerpt tablets of Šumma alu”
        (2022–2023;{' '}
        <ExternalLink href={'http://p3.snf.ch/project-205122'}>
          http://p3.snf.ch/project-205122
        </ExternalLink>{' '}
        ), and “Edition of Nabû-zuqup-kēnu’s Šumma Alu series” (2024–2028;{' '}
        <ExternalLink href={'https://data.snf.ch/grants/grant/10000955'}>
          https://data.snf.ch/grants/grant/10000955
        </ExternalLink>{' '}
        ), directed by Prof. Catherine Mittermayer at the University of Geneva
        and funded by the Swiss National Science Foundation. The complete score
        editions can be downloaded (PDF) at the “Archive ouverte” of the
        University of Geneva ({' '}
        <ExternalLink href={'https://archive-ouverte.unige.ch/'}>
          https://archive-ouverte.unige.ch/
        </ExternalLink>{' '}
        ; search for “Shumma alu”).
      </p>
      <p>
        Search for Ālu Geneva texts below or{' '}
        <ExternalLink
          href={
            'https://www.unige.ch/lettres/antic/unites/mesopotamie/projets/projet-fns-10000955-edition-de-la-version-nabu-zuqup-kenu-de-summa-alu'
          }
        >
          click here
        </ExternalLink>{' '}
        to learn more about the project.
      </p>
      <div className={'project-page__search'}>
        <h3>Search in Ālu Geneva</h3>
        <Container>
          <SearchForm
            fragmentSearchService={fragmentSearchService}
            fragmentService={fragmentService}
            wordService={wordService}
            bibliographyService={bibliographyService}
            fragmentQuery={fragmentQuery}
            dossiersService={dossiersService}
            project={'aluGeneva'}
          />
        </Container>
      </div>
      {fragmentQuery && (
        <SearchResult
          dossiersService={dossiersService}
          fragmentService={fragmentService}
          fragmentQuery={fragmentQuery}
        />
      )}
    </PageContent>
  )
}
