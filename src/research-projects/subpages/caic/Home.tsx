import React from 'react'
import ExternalLink from 'common/ExternalLink'
import ProjectHome, { ProjectHomeProps } from '../Home'

export default function CaicHome(
  props: Omit<ProjectHomeProps, 'title'>,
): JSX.Element {
  return (
    <ProjectHome {...props} title={'Introduction'}>
      <p>
        The cuneiform artifacts of the Iraq Museum in Baghdad are a central part
        of the cultural heritage of Mesopotamia, which is of great importance to
        all of humanity. As an interdisciplinary academic project, the aim of
        CAIC is to document, edit, and analyze approximately 17,000 cuneiform
        tablets both from historical and linguistic perspectives. With the help
        of the latest digital approaches it will also make them available online
        to the general public and experts from various disciplines.
      </p>
      <p>
        Search for CAIC texts below or{' '}
        <ExternalLink href={'https://caic.badw.de/'}>click here</ExternalLink>{' '}
        to learn more about the project.
      </p>
    </ProjectHome>
  )
}
