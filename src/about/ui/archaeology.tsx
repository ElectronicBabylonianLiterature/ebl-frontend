import React from 'react'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'
import { MarkdownParagraph } from 'common/ui/Markdown'

export default function AboutArchaeology(
  markupService: MarkupService,
): JSX.Element {
  function MarkupParagraph({ text }: { text: string }): JSX.Element {
    return <Markup markupService={markupService} text={text} />
  }

  return (
    <>
      <MarkdownParagraph
        text="One of the primary goals of the [CAIC project](/projects/CAIC) on the eBL
              platform is to visualize the findspots of cuneiform tablets. The CAIC platform
              will integrate different archaeological layers and also display archives and
              libraries in the individual polities of ancient Mesopotamia. Archaeological
              information for each tablet is recorded in the `archaeology` property of its
              record in the Library; a technical description of the data model is available
              [here](https://github.com/ElectronicBabylonianLiterature/generic-documentation/blob/master/guides/archaeology.md)."
      />
      <h3>I. Nineveh</h3>
      <MarkdownParagraph
        text='A repertoire of the recoverable findspots of Nineveh tablets has been compiled
              by S. Cohen-Olberding in the framework of the AHRC/DFG project
              "Reading the Library of Ashurbanipal: A Multi-sectional Analysis of
              Assyriology&apos;s Foundational Corpus"
              ([DFG project page](https://gepris.dfg.de/gepris/projekt/428991681)).
              The repertoire encompasses both the documented findspots from the more recent
              excavation campaigns and those from the nineteenth-century campaigns that can
              be reconstructed, primarily through registers available in the British Museum.
              S. Cohen-Olberding was assisted in the compilation by J. Taylor and E. Jiménez,
              and in particular by the tireless support of Julian Reade, on whose decades of
              painstaking research the reconstructed findspots are based.'
      />
      <h3>II. Nippur</h3>
      <MarkupParagraph
        text="The catalog of the finds of the first three post-war Nippur campaigns
              (@bib{nippur_catalogue}), prepared by the excavators, was part of Erle
              Leichty's Nachlass (see below). This catalog was partially digitized between
              2020 and 2022 by Marion Scheiblecker and Luis Sáenz, as members of the eBL
              team, and then between 2023 and 2024 by Kameron Kashani and Claudia González,
              who worked on a voluntary basis. We extend our sincerest thanks to all of them."
      />
    </>
  )
}
