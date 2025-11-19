import React from 'react'
import ExternalLink from 'common/ExternalLink'
import ProjectHome, { ProjectHomeProps } from '../Home'

export default function ReccHome(
  props: Omit<ProjectHomeProps, 'title'>
): JSX.Element {
  return (
    <ProjectHome {...props} title={'Introduction'}>
      <p>
        Cuneiform script, one of the world’s oldest writing systems, endured
        into the first century CE, mainly for recording Mesopotamian astronomy.
        However, many surviving non-astronomical texts remain undated and
        understudied, leaving gaps in our understanding of late Mesopotamian
        literary culture. The ERC-funded RECC project aims to uncover why
        cuneiform writing persisted in a region absorbed into expanding empires.
        The project suggests that the script’s survival reflected a cultural
        response to political change. RECC will investigate the production of
        late cuneiform texts and the networks of scribal families who sustained
        the tradition. It will use CuneiDate, a new machine learning tool that
        will enable the dating of undated tablets, potentially transforming how
        we understand the final centuries of cuneiform writing.
      </p>
      <p>
        In the prevailing view, cuneiform script survived until the first
        century CE because it was the only way to write the most enduring
        Mesopotamian science, astronomy. This view, however, is skewed by the
        nature of the data: while astronomical texts are easy to date, the vast
        majority of non-astronomical tablets cannot be dated and are overlooked
        in histories of the period. Yet, the vitality of cuneiform in its
        terminal phase suggests that a wealth of late literary and scholarly
        tablets awaits the development of new dating methods.
      </p>
      <p>
        The aim of the Rewriting the End of Cuneiform Culture (RECC) project is
        to explain why cuneiform survived long after the great Mesopotamian
        centers had lost their prominence and become provinces within vast
        empires. The hypothesis posits that the survival and flourishing of
        cuneiform is a reaction to these changes, an attempt to defend the
        native tradition against cosmopolitan cultures. With their labored
        writings, Babylonian scholars endeavored to show that their legacy still
        had the power to speak to their own world.
      </p>
      <p>
        Search for RECC texts below or{' '}
        <ExternalLink href={'https://cordis.europa.eu/project/id/101171038'}>
          click here
        </ExternalLink>{' '}
        to learn more about the project.
      </p>
    </ProjectHome>
  )
}
