import React from 'react'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import ExternalLink from 'common/ui/ExternalLink'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import MesZlSection from 'signs/ui/display/MesZlSection'
import SignLogogramsByWord from 'signs/ui/display/SignLogogramsByWord'
import SignImages from 'signs/ui/display/SignImages'
import CompositeSigns from 'signs/ui/display/CompositeSigns'
import FosseyDisplay from 'signs/ui/display/SignFossey'
import { MesZlKap2State } from 'signs/ui/display/useMesZlKap2'
import { SignSectionId, signSectionIds } from 'signs/ui/display/signSections'

function FosseySection({ sign }: { sign: Sign }): JSX.Element {
  return (
    <>
      <FosseyDisplay fosseys={sign.fossey} />
      <p className="SignPage__note">
        From Ch. Fossey,{' '}
        <em>Manuel d’assyriologie, Tome deuxième: Evolution des cunéiformes</em>
        . Paris: Conard, 1926 (
        <ExternalLink href="https://www.europeana.eu/en/rights/public-domain-charter">
          in the public domain
        </ExternalLink>
        ).
      </p>
    </>
  )
}

export default function SignSectionContent({
  id,
  sign,
  signService,
  kap2,
}: {
  id: SignSectionId
  sign: Sign
  signService: SignService
  kap2: MesZlKap2State
}): JSX.Element {
  switch (id) {
    case signSectionIds.meszl:
      return <MesZlSection kap3={sign.mesZl} kap2={kap2} />
    case signSectionIds.logograms:
      return <SignLogogramsByWord logograms={sign.logograms} />
    case signSectionIds.palaeography:
      return <SignImages signName={sign.name} signService={signService} />
    case signSectionIds.composites:
      return (
        <CompositeSigns
          signService={signService}
          query={{
            isComposite: true,
            value: replaceTransliteration(sign.name.toLowerCase()),
            subIndex: 1,
          }}
        />
      )
    case signSectionIds.fossey:
      return <FosseySection sign={sign} />
  }
}
