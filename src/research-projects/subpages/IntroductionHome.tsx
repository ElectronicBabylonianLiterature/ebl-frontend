import React from 'react'
import ExternalLink from 'common/ui/ExternalLink'
import ProjectHome, { ProjectHomeProps } from 'research-projects/subpages/Home'

export type IntroductionHomeProps = Omit<ProjectHomeProps, 'title'>

export default function IntroductionHome({
  paragraphs,
  projectName,
  projectUrl,
  ...props
}: IntroductionHomeProps & {
  paragraphs: readonly string[]
  projectName: string
  projectUrl: string
}): JSX.Element {
  return (
    <ProjectHome {...props} title={'Introduction'}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      <p>
        {`Search for ${projectName} texts below or`}{' '}
        <ExternalLink href={projectUrl}>click here</ExternalLink>{' '}
        {'to learn more about the project.'}
      </p>
    </ProjectHome>
  )
}
