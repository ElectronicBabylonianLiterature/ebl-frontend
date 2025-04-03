import React from 'react'
import ExternalLink from 'common/ExternalLink'
import ProjectHome, { ProjectHomeProps } from '../Home'

export default function AluGenevaHome(
  props: Omit<ProjectHomeProps, 'title'>
): JSX.Element {
  return (
    <ProjectHome {...props} title={'Introduction'}>
      <p>
        The editions of
        <em>Šumma ālu</em>
        presented here were prepared in the context of the projects “Edition of
        the Omen Series <em>Šumma ālu</em>” (2017–2021;{' '}
        <ExternalLink href={'http://p3.snf.ch/project-175970'}>
          http://p3.snf.ch/project-175970
        </ExternalLink>{' '}
        ), “Typology and potential of the excerpt tablets of <em>Šumma ālu</em>”
        (2022–2023;{' '}
        <ExternalLink href={'http://p3.snf.ch/project-205122'}>
          http://p3.snf.ch/project-205122
        </ExternalLink>{' '}
        ), and “Edition of Nabû-zuqup-kēnu’s <em>Šumma ālu</em> series”
        (2024–2028;{' '}
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
    </ProjectHome>
  )
}
