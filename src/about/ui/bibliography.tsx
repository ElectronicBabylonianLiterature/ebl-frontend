import React from 'react'
import { Markdown } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import afoRegisterCover from 'about/ui/static/afoRegister.png'

export default function AboutProject(
  markupService: MarkupService
): JSX.Element {
  return (
    <>
      <h3>I. Bibliography</h3>
      <Markdown
        text="One of the objectives of the eBL platform is to provide a complete and constantly
        updated bibliography of publications of cuneiform tablets. To this end, books
        and articles are regularly indexed and the indices are added to the Fragmentarium and Corpus.
        Hundreds of books and articles have been catalogued for the eBL, especially by S. Arroyo, C. 
        Dankwardt, E. Gogokhia, D. López, F. Müller, L. Sáenz, and M. Scheiblecker."
      />
      <p />
      <Markdown
        text="The reference collection of the eBL platform consists of almost 9,548 entries.
        The Fragmentarium contains a total of 214,436 references to these, the Corpus
        3,158 (as of November 2023). A complete list of the almost 600 books and articles
        that have been fully and systematically indexed by the project staff is given below:"
      />
      <h3>II. AfO-Register</h3>
      <Markdown
        text="The field of Assyriology is fortunate to have a bibliographical repertoire that
        has been published continuously since the 1970s. The
        [AfO-Register](https://orientalistik.univie.ac.at/publikationen/afo/register/) (Archiv
        für Orientforschung: Register Assyriologie), curated by the Department of Near
        Eastern Studies of the University of Vienna, is an essential bibliographical
        tool for Ancient Near Eastern Studies. Starting with Volume 25 (1974–1977),
        the AfO-Register has published comprehensive bibliographies of new Assyriological
        literature and an index in most volumes, categorized by subject areas, Akkadian
        and Sumerian words, and texts and passages. With the kind permission of the AfO
        Redaktion, the register was digitized and made searchable by the eBL team, thus
        enhancing its accessibility for researchers, students, and enthusiasts interested
        in the history and culture of Ancient Mesopotamia."
      />
      <p />
      <figure className="Introduction__photoRight">
        <img
          className="Introduction__250px"
          src={afoRegisterCover}
          alt="Cover of AfO-Register"
        />
        <figcaption className="Introduction__caption">
          Cover of AfO-Register 2015.
        </figcaption>
      </figure>
      <Markdown
        text="The digitization has been carried out in two phases. W. Sommerfeld and his
        team started the digitization of the AfO Registers Textstellen in the 2000s, and
        succeeded in transforming issues 26 to 35 into a database. The fruits of this work,
        interrupted in 2011, were not made available to the public, but were sent to several
        colleagues. The eBL team undertook the digitization of the remaining AfO Registers
        (38/39 to 54) from 2022 to 2023. Initially, the text underwent recognition through
        Google Cloud Vision. Subsequently, a student assistant (C. Dankwardt) invested
        several months in rectifying OCR errors and implementing code to systematically
        organize the data into a database. Following the conversion to a database, another
        assistant (L. Sáenz) spent months meticulously reviewing the file and standardizing
        references using the sofware OpenRefine. Given the multi-generational span of the AfO
        Registers, certain inconsistencies arose during the merging of all files: for instance,
        some AfO-Register refer to “Atram-ḫasīs”, some to “Atramhasis”. Although inconsequential
        for traditional use, this sort of variation held significant importance for the
        usability of the database."
      />
      <p />

      <Markdown
        text="The eBL interface has been implemented by I. Khait. Efforts were made to correlate
        references in the AfO-Register with data records in the eBL platform. Currently,
        approximately 8,000 out of the 40,000 entries can be linked to eBL records
        (e.g., AbB 7, 49 with [BM.67306](/fragmentarium/BM.67306)). Ongoing manual revision
        is expected to add a few thousand more links. Considering the incremental benefit, it
        seems appropriate to release the database in its current state and refine it further in the future."
      />
      <h3>III. Fully Indexed Books and Articles</h3>

      <p />

      <h4>A</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN2544}, @bib{RN108}, @bib{RN3108}, @bib{RN3108axd}, @bib{CT0058}, @bib{RN760}, @bib{RN1688}"
      />
      <h4>B</h4>
      <Markup
        markupService={markupService}
        text="@bib{baker2004archive}, @bib{fromebllab0023}, @bib{baragli2022sonnengruesse}, @bib{fromebllab0034}, @bib{fromebllab0035}, @bib{barton1900some}, @bib{PBS_9_1}, @bib{YOS_19}, @bib{bernhardtSumerischeLiterarischeTexte1961}, @bib{bernhardtSumerischeLiterarischeTexte1967}, @bib{bernhardtSozialokonomischeTexteUnd1976}, @bib{RN1800}, @bib{Biggs_Al-Hiba_1976}, @bib{biggs1988early}, @bib{RN61}, @bib{RN62}, @bib{UBHD-65281075}, @bib{RN3177}, @bib{RN850}, @bib{RN54}, @bib{RN56}, @bib{RN883}, @bib{RN1530}, @bib{RN32}"
      />
      <h4>C</h4>
      <Markup
        markupService={markupService}
        text="@bib{AbB_8}, @bib{CT0011}, @bib{CT0012}, @bib{RN2604mm}, @bib{CT0016}, @bib{RN2604z}, @bib{CT0018}, @bib{CT0019}, @bib{CT0020}, @bib{CT0022}, @bib{CT0023}, @bib{RN2980}, @bib{RN21}, @bib{PBS_8_1}, @bib{PBS_11_2}, @bib{RN2137ax}, @bib{PBS_11_3}, @bib{PBS_8_2}, @bib{RN1450}, @bib{RN861}, @bib{civil1972supplement}, @bib{RN1583}, @bib{RN2023abcxxx}, @bib{RN2023abc}, @bib{civil2005latebabylonian}, @bib{civil2005syllabaries}, @bib{civil2005texts}, @bib{BE_A_10}, @bib{BE_A_14}, @bib{BE_A_15}, @bib{BE_A_8_1}, @bib{PBS_2_1}, @bib{PBS_2_2}, @bib{YOS_1}, @bib{YOS_3}, @bib{cohen_sumerian_1981}, @bib{RN230}, @bib{RN311a}, @bib{RN791}, @bib{RN2740}, @bib{RN2740a}"
      />
      <h4>D</h4>
      <Markup
        markupService={markupService}
        text="@bib{vondassow2000neobabylonian}, @bib{vondassow2000neobabylonianprivate}, @bib{debourse2022priests}, @bib{delaunay1977moldenke}, @bib{CT0054}, @bib{RN2769}, @bib{VS_17}, @bib{RN570}, @bib{YOS_11}, @bib{RN569}, @bib{dijk2003ur}, @bib{RN2110}, @bib{YOS_20}, @bib{YOS_6}"
      />
      <h4>E</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN2605}, @bib{RN2742}, @bib{RN1271vv}, @bib{ellis1984neobabylonian}, @bib{ellis1997notes}, @bib{englund2014late}, @bib{evetts1892inscriptions}"
      />
      <h4>F</h4>
      <Markup
        markupService={markupService}
        text="@bib{NAR3}, @bib{RN2304}, @bib{RN311h}, @bib{RN311i}, @bib{falkenstein_literarische_1931}, @bib{RN1355}, @bib{RN1824}, @bib{YOS_8}, @bib{YOS_12}, @bib{VS_13}, @bib{CT0042}, @bib{CT0043}, @bib{CT0047}, @bib{RN2766}, @bib{temp_id_9814145298557961}, @bib{RN172xa}, @bib{RN1609}, @bib{RN168}, @bib{finkel2005documents}, @bib{RN1804}, @bib{CT0048}, @bib{YOS_13}, @bib{fromebllab0004}, @bib{fromebllab0006}, @bib{fromebllab0012}, @bib{fromebllab0020}, @bib{fromebllab0030}, @bib{fromebllab0031}, @bib{VS_14}, @bib{RN812}, @bib{YOS_21}, @bib{frame2014nassyrian}, @bib{frame2014nbinscriptions}, @bib{frame2014neoassyrian}, @bib{frame2014neoassyrianroyal}, @bib{frame2014neobabylonian}, @bib{frame2014neobabylonianinscriptions}, @bib{frame2014neobabylonianroyal}, @bib{frame2014royal}, @bib{AbB_2}, @bib{AbB_3}, @bib{RN1991}, @bib{RN148}, @bib{freedman2005documents}, @bib{RN1173}, @bib{RN3178}, @bib{VS_19}, @bib{MARV_3}, @bib{frydank1997noch}, @bib{MARV_4}, @bib{MARV_5}, @bib{MARV_6}, @bib{MARV_7}, @bib{RN1278}, @bib{RN1279}, @bib{friberg2005mathematical}, @bib{RN3094xf}, @bib{RN311f}"
      />
      <h4>G</h4>
      <Markup
        markupService={markupService}
        text="@bib{gabbay2014sumerian}, @bib{RN2568}, @bib{fromebllab0015}, @bib{fromebllab0024}, @bib{CT0036}, @bib{CT0038}, @bib{RN2700zza}, @bib{RN2700zz}, @bib{CT0041}, @bib{temp_id_4742648949597732}, @bib{RN2813xs}, @bib{RN1818}, @bib{RN903}, @bib{RN1711}, @bib{RN967}, @bib{RN2547}, @bib{Geller2020}, @bib{RN124}, @bib{RN1914}, @bib{RN117}, @bib{george2005measurements}, @bib{RN3}, @bib{RN1013a}, @bib{RN1013ab}, @bib{gesche2005latebabylonian}, @bib{goddeeris2016old}, @bib{YOS_10}, @bib{YOS_15}, @bib{RN262}, @bib{RN2799}, @bib{RN258}, @bib{RN904}, @bib{YOS_5}"
      />
      <h4>H</h4>
      <Markup
        markupService={markupService}
        text="@bib{hackl2014spaetbabylonische}, @bib{hackl2016additions}, @bib{YOS_22}, @bib{UBHD-2021282}, @bib{CT0027}, @bib{RN2700ke4}, @bib{RN2604aaa}, @bib{RN2604azz}, @bib{RN2623}, @bib{fromebllab0002}, @bib{fromebllab0011}, @bib{fromebllab0022}, @bib{fromebllab0028}, @bib{RN1745xx}, @bib{HauptNimrod}, @bib{RN1156}, @bib{RN2805}, @bib{KAL13}, @bib{RN3094a}, @bib{fromebllab0005}, @bib{fromebllab0009}, @bib{fromebllab0017}, @bib{fromebllab0018}, @bib{BE_A_1_1}, @bib{BE_A_1_2}, @bib{BE_A_9}, @bib{BE_D_1}, @bib{BE_A_20_1}, @bib{RN2817aa}, @bib{BE_D_4}, @bib{RN2700a}, @bib{RN500}, @bib{KAL14}, @bib{RN497}, @bib{LS125}, @bib{RN2049}, @bib{LS159}, @bib{LS159as}, @bib{LS159asdf}, @bib{hunger2022astronomical}"
      />
      <h4>J</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN2805zzxx}, @bib{jakobrost1968neubabylonisches}, @bib{jakobrost1970urkunden}, @bib{jakobrost1972spaetbabylonische}, @bib{VS_20}, @bib{VS_21}, @bib{VS_23}, @bib{NAR1}, @bib{VS_28}, @bib{NAR2}, @bib{RN3647}, @bib{fromebllab0001}, @bib{fromebllab0003}, @bib{fromebllab0008}, @bib{fromebllab0010}, @bib{fromebllab0016}, @bib{fromebllab0027}, @bib{fromebllab0032}, @bib{jimenez2022middle}, @bib{joannes1987fragments}, @bib{RN1735}, @bib{jursa1999archiv}, @bib{jursa2014neoassyrian}, @bib{jursa2014neolate}"
      />
      <h4>K</h4>
      <Markup
        markupService={markupService}
        text="@bib{UBHD-31041537}, @bib{YOS_4}, @bib{CT0049}, @bib{LS243}, @bib{kilmer2005akkadian}, @bib{CT001}, @bib{UBHD-65324131}, @bib{CT003}, @bib{CT005}, @bib{CT007}, @bib{CT0010}, @bib{CT009}, @bib{RN2700}, @bib{RN1525}, @bib{RN2604}, @bib{CT0021}, @bib{CT0024}, @bib{CT0025}, @bib{CT0026}, @bib{CT0029}, @bib{CT0032}, @bib{CT0033}, @bib{RN2604a}, @bib{RN1189a}, @bib{RN1189}, @bib{RN1153ax}, @bib{AOAT_358}, @bib{kleinerman2011education}, @bib{VS_18}, @bib{VS_22}, @bib{VS_29}, @bib{RN465}, @bib{RN464}, @bib{RN1271ae}, @bib{BAM_2}, @bib{RN1271e}, @bib{RN1271c}, @bib{RN1271b}, @bib{RN1271a}, @bib{RN1271}, @bib{SLTNi}, @bib{ISET_1}, @bib{ISET_2}, @bib{ISET_3}, @bib{RN2100ab}, @bib{AbB_1}, @bib{AbB_4}, @bib{RN2100}, @bib{RN1334}, @bib{AbB_10}, @bib{krueckmannNeubabylonischeRechtsUnd1933a}, @bib{RN311c}"
      />
      <h4>L</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN444}, @bib{RN2801}, @bib{RN432}, @bib{CT0046}, @bib{RN435}, @bib{RN429}, @bib{RN790}, @bib{lambert2005bilingual}, @bib{lambert2005fragment}, @bib{lambert2005hymns}, @bib{lambert2005inscription}, @bib{lambert2005introduction}, @bib{lambert2005miscellaneous}, @bib{lambert2005petitions}, @bib{lambert2005rituals}, @bib{lambert2005unidentified}, @bib{lambert2005weidner}, @bib{RN1023}, @bib{RN920}, @bib{RN433}, @bib{RN1013}, @bib{lambert2023an}, @bib{RN3006}, @bib{RN2023bb}, @bib{LS452}, @bib{RN3028a}, @bib{UBHD-3960407}, @bib{RN2023b}, @bib{RN2023aa}, @bib{UBHD-3937524}, @bib{RN2023a}, @bib{LS78}, @bib{RN3028}, @bib{RN2023ab}, @bib{RN311b}, @bib{RN2689a}, @bib{BE_A_31}, @bib{RN2137}, @bib{PBS_10_2}, @bib{PBS_10_3}, @bib{PBS_12_1}, @bib{PBS_10_4}, @bib{langdon_babylonian_1927}, @bib{RN3242ax}, @bib{larsen1988oldassyrian}, @bib{CT0035}, @bib{PBS_13}, @bib{PBS_14}, @bib{PBS_15}, @bib{RN839}, @bib{leichty2005documents}, @bib{leichty2014neoassyrian}, @bib{lewyKeilschrifttexteAusKleinasien1932a}, @bib{RN1301}, @bib{RN388}, @bib{RN384}, @bib{RN1799}, @bib{Loretz1978}, @bib{YOS_2}, @bib{RN2700bb}, @bib{RN376}, @bib{RN376a}"
      />
      <h4>M</h4>
      <Markup
        markupService={markupService}
        text="@bib{macginnis1995letter}, @bib{RN3094}, @bib{VS_25}, @bib{VS_27}, @bib{RN1582aa}, @bib{RN311j}, @bib{RN366}, @bib{RN364}, @bib{RN2842}, @bib{RN2223}, @bib{RN977}, @bib{RN365}, @bib{RN901}, @bib{maul2013altorientalischer}, @bib{KAL6}, @bib{RN2805xs}, @bib{KAL15}, @bib{RN355}, @bib{RN2740yy}, @bib{UBHD-LS}, @bib{RN347a}, @bib{RN2875}, @bib{meissnerBabylonischenKleinplastiken1934}, @bib{RN346}, @bib{VS_1}, @bib{CT0046Mil}, @bib{fromebllab0007}, @bib{fromebllab0013}, @bib{fromebllab0014}, @bib{fromebllab0019}, @bib{fromebllab0025}, @bib{fromebllab0026}, @bib{moldenke1893ctmma}, @bib{PBS_3}, @bib{moran1988amarna}, @bib{mueller-kessler2005zauberschalentexte}, @bib{RN2800}, @bib{BE_A_3_1}"
      />
      <h4>N</h4>
      <Markup
        markupService={markupService}
        text="@bib{YOS_16}, @bib{RN1438}, @bib{Nougayrol1979}"
      />
      <h4>O</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN681}, @bib{RN804}, @bib{RN3639ax}, @bib{RN7458}"
      />
      <h4>P</h4>
      <Markup
        markupService={markupService}
        text="@bib{CT0053}, @bib{RN311aa}, @bib{RN311aaa}, @bib{RN311e}, @bib{RN311}, @bib{RN311g}, @bib{RN311x}, @bib{PearceLate}, @bib{RN1274}, @bib{RN945}, @bib{fromebllab0033}, @bib{CT002}, @bib{CT004}, @bib{CT006}, @bib{CT008}, @bib{RN1971a}, @bib{RN808a}, @bib{CT0044}, @bib{CT0045}, @bib{CT0055}, @bib{CT0056}, @bib{CT0057}, @bib{pittman1988seal}, @bib{BE_A_6_2}, @bib{PBS_5}, @bib{PBS_6_1}, @bib{RN2145}, @bib{LS244}, @bib{LS244b}, @bib{pohlVorsargonischeUndSargonische1935}, @bib{pohlRechtsUndVerwaltungsurkunden1937}, @bib{RN296}, @bib{postgate1969neoassyrian}, @bib{postgate1988middleassyrian}, @bib{RN1507}, @bib{postgate2000neoassyrian}, @bib{MARV_10}, @bib{RN2821}, @bib{TMH_NF8}"
      />
      <h4>R</h4>
      <Markup
        markupService={markupService}
        text="@bib{BE_A_17_1}, @bib{BE_D_5_2}, @bib{BE_A_29_1}, @bib{BE_A_30_1}, @bib{RN2817aaxg}, @bib{BE_A_6_1}, @bib{RN1971ax}, @bib{RN1971axx}, @bib{RN2016}, @bib{RN2023aab}, @bib{RN2845}, @bib{RN1876}, @bib{RN286}, @bib{reiner2005commentaries}, @bib{reiner2005documents}, @bib{reiner2005medical}, @bib{RN3157}, @bib{RN3085}, @bib{RN2769a}, @bib{reynolds_2019}, @bib{RN275}, @bib{rochberg1998babylonian}, @bib{fromebllab0021}, @bib{fromebllab0029}"
      />
      <h4>S</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN1773}, @bib{RN808}, @bib{RN808xy}, @bib{RN2280}, @bib{RN2814}, @bib{sarkisian1978bruchstuecke}, @bib{schaudig_2020_Staatsrituale}, @bib{temp_id_11313936447857387}, @bib{schneider1930geschaeftsurkunden}, @bib{SchollGR}, @bib{RN522}, @bib{RN521}, @bib{RN569a}, @bib{VS_11}, @bib{VS_15}, @bib{VS_16}, @bib{schroeder1920keilschrifttexte}, @bib{RN519}, @bib{RN510}, @bib{RN518a}, @bib{RN541}, @bib{RN1287}, @bib{sigrist1988brick}, @bib{sigrist1988cone}, @bib{sigrist1988oldbabylonian}, @bib{sigrist1988uriii}, @bib{YOS_14}, @bib{RN1971aaax}, @bib{RN1971aaa}, @bib{CT0037}, @bib{YOS_18}, @bib{RN1582a}, @bib{RN566}, @bib{CT0050}, @bib{sollberger1988oldakkadian}, @bib{spada2018sumerian}, @bib{spar1988ctmma1}, @bib{spar2000ctmma3}, @bib{RN829}, @bib{spar2014ctmma4}, @bib{vanderspek1998cuneiform}, @bib{RN615}, @bib{starr2005documents}, @bib{YOS_9}, @bib{RN1333}, @bib{RN1707}, @bib{stol1988oldbabylonian}, @bib{stolper1985entrepreneurs}, @bib{LS133}, @bib{RN2956}, @bib{stolper2014neolate}, @bib{stolper2014royal}, @bib{RN2702xzz}, @bib{RN2702zzz}, @bib{RN2702xxr}, @bib{RN2702xxy}, @bib{RN2702xxz}, @bib{RN122rt}"
      />
      <h4>T</h4>
      <Markup markupService={markupService} text="@bib{RN588}, @bib{YOS_7}" />
      <h4>U</h4>
      <Markup
        markupService={markupService}
        text="@bib{VS_3}, @bib{VS_4}, @bib{VS_5}, @bib{VS_6}, @bib{VS_7}, @bib{VS_8}, @bib{VS_9}, @bib{PBS_7}"
      />
      <h4>v</h4>
      <Markup markupService={markupService} text="@bib{AbB_12}, @bib{AbB_13}" />
      <h4>V</h4>
      <Markup
        markupService={markupService}
        text="@bib{VS_26}, @bib{RN563}, @bib{RN2811}, @bib{RN2750}, @bib{RN1343}, @bib{RN3169}, @bib{RN556}, @bib{RN556cf}, @bib{RN556a}, @bib{RN556kkxc}, @bib{volk2005hymns}"
      />
      <h4>W</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN2604aa}, @bib{CT0052}, @bib{RN778}, @bib{walker2005astronomical}, @bib{wallenfels2014late}, @bib{wallenfels2014latebabylonian}, @bib{RN3091}, @bib{RN545a}, @bib{WeiHru2018}, @bib{KAL11}, @bib{YOS_17}, @bib{UBHD-1553948}, @bib{UBHD-1553949}, @bib{UBHD-1553950}, @bib{Wunsch1993A}, @bib{Wunsch1993B}, @bib{wunsch1997richter}, @bib{wunschEgibiArchivFelderUnd2000}"
      />
      <h4>Z</h4>
      <Markup
        markupService={markupService}
        text="@bib{RN637}, @bib{RN1693}, @bib{VS_2}, @bib{VS_10}, @bib{RN3006ax}, @bib{RN2265}"
      />
    </>
  )
}
