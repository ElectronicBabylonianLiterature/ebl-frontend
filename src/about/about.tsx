import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { Markdown } from 'common/Markdown'
import { SectionCrumb } from 'common/Breadcrumbs'
//import ReferenceInjector from 'transliteration/application/ReferenceInjector'
//import BibliographyService from 'bibliography/application/BibliographyService'

//const referenceInjector = new ReferenceInjector(bibliographyService)

export default function About(bibliographyService): JSX.Element {
  console.log(bibliographyService)
  return (
    <AppContent title="About" crumbs={[new SectionCrumb('About')]}>
      <Tabs defaultActiveKey="corpus" id={''} mountOnEnter unmountOnExit>
        <Tab eventKey="corpus" title="Corpus">
          <Markdown text={TEXT} />
        </Tab>
        <Tab eventKey="fragmentarium" title="Fragmentarium">
          <Markdown text={LOREM2} />
        </Tab>
      </Tabs>
    </AppContent>
  )
}

/*const LOREM1 = `# Est possit sponte pendeat utque multae quam

## Dixit obstipuere facile artus

Lorem markdownum ignis heu. Quod latas manus petunt montesque illis quisquis
monte rostris cepere sonis eductam, vivunt sociorum. Hic nam infitianda amans
librat, se et, nec curvae, oscula tiliae ore annis votis **hunc** bucina?

  ad_lamp = macOrientationSystem;
  var saas = marketFileCifs;
  if (ddrUpGibibyte(search_led_commerce, tftDiskCard(dll_flash, panel_smtp,
    disk), streamingFlatbedDot(refresh.bingVfat.restore(regular,
    botColdMalware, aluType), sampleMpegSubdirectory))) {
    interface_surface_touchscreen(word_windows_on);
    sqlCadMac = system - bit_windows_im;
    nic_p(wordUp);
  }
  var ribbon_bit_trash = uml.agpBoolean(bot.operation_integer_personal(
    drive_syntax, port(-2, mca)), insertion_login_sector,
    systray_workstation_ipv);

Amicis agmen nec montes [et Ianthen si](http://www.hectora.net/sacraille.aspx)
conanti fores vellem quod sit exspectatoque quod removit? Motu exercetque erat
tamen eventu inde illud resoluta queat me pudorque margine nymphas; tota. Dente
lacus modo pingues, ferrum vivaque aliquid **genetrice Minos**, exempla procul
novas parias: Iove. Tenuatus Aiax sunt bis
[consistere](http://www.nece-virgam.net/ille-liceat.php) vicit.`
*/

const LOREM2 = `# Indicat truncos

Quod vere est rabiemque modo flecti Euryte, lacertis securior misit fratri
relicto in formosissimus labori campi. Momenta in pendent agrestes animalia,
muros meos tento veniebat mihi. Cur fuerat versus, tenebat et victoria ossaque
circumstetit vestes patitur. *Desperat* et nunc inde et antrum Dolona hic pete
fidissima quam Aurora calido infelix! In enim
[morientum](http://mihiilli.org/ictu), mutarent priscum (@bib{RN117@123}).

  analog_url.docking_clean_serial(expression(output - 81, 1, 97 + dram_push),
    srgb(record, layout) + languageOop);
  if (78) {
    flaming = basic_mini_manet(teraflops_target.click_client_friend(pci,
      22));
    impact_image(50);
  } else {
    isp = pptpLifoShift + duplexNet * tiger_serial_bar;
    affiliateSubdirectoryPrinter += dFunctionBackup(smm_cisc_media, 41,
      bootSata);
  }
  threadingParameter(ctp_technology_configuration, interface_mail,
    addressRuntimeDonationware(hoc_recursion));

![alt text](http://localhost:3000/static/media/ebl_chart.5da46666.jpg)

Quandoquidem vestem me ingratus nostrum, adspicio frustra se regemque nec
ducemque sanguine agros: *sensit*. O pleno: **ille** Neoptolemum **vicit**
resolvent dextris parte, iter fuit caput in abit deseret regit tabellis. Late
languentique errat exemploque quidem; estque Stygia: erectus sic et se *aetas*
flamma it circumdata. Oraque misit artus caeli, vindicet mirum doleam usus morte
quasque.

Mota mihi, Phoebus! Instructa adhibere harena at nec est terga cognovi; ver suae
**venerantur**, locus. Atque leonem pressa comas sumpserat Gryneus **leones**
fata Gryneus per verba tumidaque pudorem medeatur genitor et rarescit, dea. Et
ne numen ferumque cum summas possis penderet, fuit tua nec tigres, ad *ab
finemque*, nec. Quam pius petit quoque inpono **trabes** eundem praeferre
Phorcynida, glandes!`

const TEXT = `
The sign interface of the electronic Babylonian Literature project aims to provide a comprehensive, reliable, and quickly accessible reference tool for cuneiform script. The various sections benefit greatly from various publications on cuneiform palaeography, both digital and traditional; some of them have been digitized for the first time in the framework of the eBL project.

## I. Sign Information 

The  sign  list  of  the  electronic  Babylonian  Literature  project is  based on the [http://oracc.museum.upenn.edu/ogsl/](Oracc Global Sign List), used by permission of S. Tinney. Deviations from that list are not marked in any particular way. The fonts used in the epigraphy section were all designed by S. Vanserveren, who has made them freely available for the scientific community. They can be downloaded at [https://www.hethport.uni-wuerzburg.de/cuneifont/] (this link). Dr. Vanserveren was kind enough to develop an entire font (Esagil, Neo-Babylonian) at our request. The logograms that appear with each sign are cited from W. Schramm’s *Akkadische Logogramme* (Göttinger Beiträge zum Alten Orient 5. Göttingen, ²2010; [https://creativecommons.org/licenses/by-nd/3.0/de/](CC BY-ND 3.0)). The book is used by permission of its author. 

## II. Mesopotamisches Zeichenlexikon

A great debt of gratitude is owed to Thomas R. Kämmerer, editor-in-chief of Ugarit-Verlag, for his permission to digitize and make publicly available on this website the third chapter of R. Borger’s *Mesopotamisches Zeichenlexikon* (Alter Orient und Altes Testament 305. Münster, ²2010). Borger’s work has been digitized by E. Gogokhia, and proofread by S. Cohen, A. Hätinen, and E. Jiménez. The cuneiform has been coded in Unicode and is displayed using S. Vanserveren’s [https://www.hethport.uni-wuerzburg.de/cuneifont/](Assurbanipal font). Thanks are expressed to Dr. Vanserveren for her readiness to adapt and expand her font to contain all glyphs from *MesZL*². Following Borger’s request in *MesZL*² p. viii, the very few deviations of the electronic edition with respect to the printed version of the sign list are marked in a <span style="color: #00610F;">different color</span>. These deviations have the goal of correcting the very few typos of the first and second editions, such as the repeated paragraph in p. 418 (see [https://www.ebl.lmu.de/signs/DIŠ](here)). R. Borger himself was rather skeptical regarding the possible digitization of his *MesZL*: in the preface to his second edition, he states: “Hin und wieder wird geträumt vom Ersatz der Buch-Fassung durch eine Internet-Fassung. Der geistige Nährwert des Umwegs über das Internet scheint mir sehr gering. Die technischen Probleme solch einer Umsetzung dürften kaum lösbar sein. Ich nehme übrigens an, dass mein Buch die heutigen Internet-“Publikationen” und CDs lange überleben wird” (p. viii).  It is hoped that the care that the eBL put into the digitization of his *magnum opus* would have made the project acceptable to him. The entire *MesZL*², not only the third chapter reproduced on this website, is an indispensable tool for reading cuneiform texts, and all users of the eBL sign interface are encouraged to buy the book from Ugarit-Verlag, following [https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514] (this link).

## III. Fossey, Manuel d’assyriologie II

Fossey’s monumental *Manuel d’assyriologie* II (Paris, 1926) is still today the best resource for cuneiform palaeography. The collection of signs from all periods and regions known in Fossey’s day has aged well and, although many additional periods, cities, and sign forms could be added today, the book remains unsurpassed. Following the book’s entrance into public domain in 2016, it has been digitized by a joint team led by E. Jiménez and Sh. Gordin. R. Borger’s concordance of Fossey’s list, included in the second chapter of his *Mesopotamisches Zeichenlexikon*, was digitized by E. Gogokhia, and forms the basis for the display of the book on the eBL website. The signs have been vectorized, the handwriting recognized and, whenever possible, links have been added to the Fragmentarium,  where  the user  can  find  the newest bibliography and, when available, also a transliteration.

## IV. Palaeography
The tool for tagging images of cuneiform tablets that is at the core of the palaeography section was implemented by J. Laasonen in the framework of the project “Searching through Ancient Libraries: New Statistical Indexing Methods for 2D Images of Cuneiform Documents” (Y. Cohen, E. Jiménez, Sh. Gordin), financed by a Call for Joint Research Project on Data Science between Ludwig-Maximilians-Universität München (LMU) and Tel Aviv University (TAU). The entire eBL team has contributed to the tagging of tablets, but the labor of N. Wenner, L. Sáenz, M. Fadhil, and S. Cohen should be singled out. More tablets are being tagged daily; in addition, the automatic tagging of photographs will be implemented soon`
