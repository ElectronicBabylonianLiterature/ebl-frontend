import React from 'react'
import { MarkdownParagraph } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import shamash134 from 'about/ui/static/shamash134.jpg'
import ee49 from 'about/ui/static/ee49.png'
import geneva from 'about/ui/static/geneva.jpg'
import muses from 'about/ui/static/muses.jpg'
import snf from 'about/ui/static/snf.png'

export default function AboutCorpus(markupService: MarkupService): JSX.Element {
  return (
    <>
      <blockquote>
        <p>
          <em>
            Ohne feste kritische Grundlage wird das philologische Gebäude auf
            Sand aufgeführt und die philologische Wissenschaft gestaltet sich
            zum bloßen Dilettantismus.
          </em>
        </p>

        <MarkdownParagraph text="W. Freund, [_Triennium philologicum oder Grundzüge der philologischen Wissenschaften_](https://books.google.de/books?id=PFJeAAAAcAAJ&printsec=frontcover&source=gbs_ge_summary_r&cad=0#v=onepage&q&f=false). Leipzig, 1874." />
      </blockquote>
      <MarkdownParagraph
        text="The eBL editions aim to present the best text that can be reconstructed at 
              present. The editions prepared in the course of the project include all 
              previous scholarship on the texts, and in particular all new manuscripts 
              identified after the last printed editions. The eBL edition of the [*Cuthaean 
              Legend of Narām-Sîn*](/corpus/L/1/12), for instance, almost doubles the 
              manuscript basis of the text available to its last editor; that of the 
              [*Counsels of Wisdom*](/corpus/L/2/3) includes over twenty new manuscripts that 
              were absent from the most recent printed edition. Most of the new manuscripts 
              used have been identified by the eBL team, and are currently being published in 
              the series of articles *From the Electronic Babylonian Literature Lab* that 
              appear in the journal *Kaskal*. Moreover, the eBL editions are constantly 
              updated, and the editors will incorporate new discoveries as they appear."
      />
      <h3>I. Corpus</h3>
      <Markup
        markupService={markupService}
        text="The core corpus of literature of the eBL project is divided into three 
              categories: Narrative Poetry, Monologue and dialogue literature, and Literary 
              Hymns and Prayers, a tripartite division that has been advocated for other 
              periods and languages in Mesopotamia (e.g. by @bib{RN754@67–69}). The texts in 
              each category have been edited by members of the eBL team, who have worked 
              closely with B. R. Foster and, in the case of @i{Gilgameš}, with A. R. George."
      />
      <h3>II. Translations</h3>
      <figure className="Introduction__photoRight">
        <a href="https://www.eisenbrauns.org/books/titles/978-1-883053-76-5.html">
          <img
            className="Introduction__200px"
            src={muses}
            alt="Foster, Before the Muses"
          />
        </a>
        <figcaption className="Introduction__caption">
          Foster, <em>Before the Muses</em>
        </figcaption>
      </figure>
      <Markup
        markupService={markupService}
        text="The English translations on the eBL platform have been prepared by Benjamin R. 
              Foster, Laffan Professor of Assyriology and Babylonian Literature (Yale 
              University). Foster is the author of a much-cited English anthology of 
              Babylonian literature (@bib{RN164}). Prof. Foster has kindly updated his 
              translations of texts in the course of 2019–2023 to match the new editions."
      />
      <MarkdownParagraph
        text="Additional translations have been produced by A. R. George (*Gilgameš*), W. G. 
              Lambert ([A Syncretistic Hymn to Ištar](/corpus/L/3/3) and [Marduk’s Address to 
              the Demons](/corpus/L/3/3)), T. Mitto ([Catalogue of Texts and 
              Authors](/corpus/L/0/0) and [Hymn to Ninurta as Savior](/corpus/L/3/10)) and E. 
              Jiménez."
      />

      <MarkdownParagraph
        text="In addition, a series of translations into Arabic are in preparation by A. A. 
              Fadhil, W. Khatabe, and W. Zerkly (see for now A. A. Fadhil’s Arabic 
              translation of [*Enūma eliš* I](/corpus/L/1/2/SB/I))"
      />
      <h3>III. Ideal Text</h3>
      <MarkdownParagraph
        text="The main version displayed on the eBL Corpus is a phonetic transcription of the 
              text, which has been adjusted according to the rules of Standard Babylonian 
              grammar. This practice somewhat departs from the Assyriological tradition of 
              editing “eclectic” texts, i.e. transliterations that combine the readings of 
              various manuscripts. It has been adopted, however, in the conviction that 
              Mesopotamian texts are also objects of art, and not just objects of scientific 
              study, and as such convey their message only through the interplay of form and 
              content."
      />
      <figure className="Introduction__photoLeft">
        <img
          className="Introduction__450px"
          src={ee49}
          alt="eBL edition of Enūma eliš I 49"
        />
        <figcaption className="Introduction__caption">
          eBL edition of <em>Enūma eliš</em>{' '}
          <a href="/corpus/L/1/2/SB/I#49">I 49</a>
        </figcaption>
      </figure>
      <MarkdownParagraph
        text="The practice of using a phonetic transcription as the main text no doubt has 
              disadvantages: for instance, it obscures the way in which the text is written 
              in cuneiform, and it affords a sense of grammatical certainty that is absent 
              from a regular transliteration. However, it also offers considerable 
              advantages: in particular, it does not require the editor to adopt any 
              particular spelling when no good criteria exist for preferring one over the 
              other. In *Enūma eliš* [I 49](/corpus/L/1/2/SB/I#49) (see the adjoining image), 
              for instance, the editor would have to choose between the accusative 
              *al-ka-ta*, attested only in Assyrian manuscripts, or the normal Babylonian 
              spelling *al-ka-tu*₄. In a transcription the editor can convey his 
              interpretation of the text in a much more satisfactory manner than in a 
              traditional transliteration."
      />
      <MarkdownParagraph
        text="The transcription respects the ways in which the manuscripts are written as 
              much as possible. For instance, *Enūma eliš* [VI 124](/corpus/L/1/2/SB/VI#124) 
              is transcribed as *muṭaḫḫidu urîšun*, “who enriches their stables,” and thus 
              assumes a hymno-epic ending -*u* of the *nomen regens*, instead of the normal 
              bound form *muṭaḫḫid*, since *mu-ṭaḫ-ḫi-du* is the spelling of all manuscripts."
      />
      <h3>IV. Score Edition</h3>
      <figure className="Introduction__photoRight">
        <img
          className="Introduction__450px"
          src={shamash134}
          alt="eBL edition of Šamaš Hymn 134"
        />
        <figcaption className="Introduction__caption">
          eBL edition of <em>Šamaš Hymn</em>{' '}
          <a href="/corpus/L/3/4/SB/-#134">134</a>
        </figcaption>
      </figure>
      <MarkdownParagraph
        text="Since the number of manuscripts of each text is constantly growing, cuneiform 
              studies is reaching the point where it is no longer possible to print text 
              editions in the score format. Just the eBL edition score of *Enūma eliš*, for 
              example, would require some 300 pages in font size 10. Despite this technical 
              limitation, scores are the fastest, most straightforward way of checking 
              exactly how manuscripts write their texts. The eBL scores are, moreover, 
              aligned with the ideal line, so that the reader can check the manuscript basis 
              of the editor’s decisions at any time."
      />
      <MarkdownParagraph
        text="All transliterations have been checked twice against the published copies and 
              against photographs and in some cases the originals of the cuneiform tablets."
      />
      <h3>V. Paratextual information</h3>
      <MarkdownParagraph
        text="Each text is furnished with an introduction, which discusses the content and 
              structure of the text, its origins and transmission, its Sitz im Leben and the 
              history of research concerning the text."
      />
      <MarkdownParagraph
        text="The editions are fully lemmatized and annotated. The annotation includes 
              indications of all parallel lines, so that the text can be studied as part of 
              the intertextual network in which it belongs. In addition, the notes on 
              individual lines endeavor to provide the reader with references to all previous 
              bibliography, with particular emphasis on studies which have appeared in the 
              last few years. The notes on the score edition discuss mostly philological 
              issues pertaining to an individual manuscript."
      />
      <MarkdownParagraph
        text="The colophons of the individual manuscripts are transliterated independently, 
              and can be accessed on the homepage of any text (e.g. [here](/corpus/L/1/4)). 
              In some cases, manuscripts include lines that, though clearly part of the 
              composition in question, cannot yet be placed in it, and thus are 
              transliterated independently, as Unplaced lines."
      />
      <h3>VI. Šumma ālu</h3>
      <MarkdownParagraph
        text="The editions of *Šumma ālu* presented here were prepared in the context of the 
              projects “Edition of the Omen Series Šumma Alu” (2017–2021; 
              [http://p3.snf.ch/project-175970](http://p3.snf.ch/project-175970)) and 
              “Typology and potential of the excerpt tablets of Šumma alu” (2022–2023; 
              [http://p3.snf.ch/project-205122](http://p3.snf.ch/project-205122)), both 
              directed by Prof. Catherine Mittermayer at the University of Geneva and funded 
              by the Swiss National Science Foundation. The complete score editions can be 
              downloaded (PDF) at the “Archive ouverte” of the University of Geneva 
              ([https://archive-ouverte.unige.ch/](https://archive-ouverte.unige.ch/); search 
              for “Shumma alu”)."
      />
      <figure className="Introduction__photoCentered">
        <a href="https://www.unige.ch/">
          <img src={geneva} alt="Université de Genève" />
        </a>
        <a href="https://www.snf.ch/fr">
          <img
            src={snf}
            alt="Fonds national suisse de la recherche scientifique"
          />
        </a>
      </figure>
    </>
  )
}
