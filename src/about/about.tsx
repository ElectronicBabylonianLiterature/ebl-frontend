import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { Markdown } from 'common/Markdown'

const LOREM = `# Est possit sponte pendeat utque multae quam

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
[consistere](http://www.nece-virgam.net/ille-liceat.php) vicit.

## Indicat truncos

Quod vere est rabiemque modo flecti Euryte, lacertis securior misit fratri
relicto in formosissimus labori campi. Momenta in pendent agrestes animalia,
muros meos tento veniebat mihi. Cur fuerat versus, tenebat et victoria ossaque
circumstetit vestes patitur. *Desperat* et nunc inde et antrum Dolona hic pete
fidissima quam Aurora calido infelix! In enim
[morientum](http://mihiilli.org/ictu), mutarent priscum.

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

export default function About(): JSX.Element {
  return (
    <AppContent title="About">
      <Tabs defaultActiveKey="corpus" id={''} mountOnEnter unmountOnExit>
        <Tab eventKey="corpus" title="Corpus">
          <Markdown text={LOREM} />
        </Tab>
        <Tab eventKey="fragmentarium" title="Fragmentarium">
          <Markdown text={LOREM} />
        </Tab>
      </Tabs>
    </AppContent>
  )
}
