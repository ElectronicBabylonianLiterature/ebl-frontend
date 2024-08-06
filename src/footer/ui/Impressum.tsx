import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import React, { useEffect } from 'react'

export default function Impressum({
  pathname,
}: {
  pathname: string
}): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <AppContent title="Impressum" crumbs={[new TextCrumb('Impressum')]}>
      <section>
        <address>
          Cuneiform Artefacts of Iraq in Context (CAIC)
          <br />
          Bayerische Akademie der Wissenschaften
          <br /> Alfons-Goppel-Str. 11 (Residenz)
          <br /> D-80539 München <br />
          Telefon 089 23031-0 <br />
          Telefax 089 23031-1100 <br />
          <a href="mailto:info@badw.de">E-Mail</a> <br />
          <a href="https://caic.badw.de/">https://caic.badw.de/</a>
        </address>
        <p>
          Zusätzliche Informationen gem. Gesetz über rechtliche
          Rahmenbedingungen für den elektronischen Geschäftsverkehr (EGG) in
          Verbindung mit § 5 Telemediengesetz (TMG):
        </p>
        <p>
          Die Bayerische Akademie der Wissenschaften ist eine Körperschaft des
          öffentlichen Rechts. Sie wird durch den Präsidenten Prof. Dr. Markus
          Schwaiger gesetzlich vertreten. Zuständige Aufsichtsbehörde:
          Bayerisches Staatsministerium für Wissenschaft und Kunst, 80333
          München.
        </p>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE
          811209280
        </p>
        <p>
          Verantwortlich im Sinne des Presserechts: Bianca Marzocca,
          Generalsekretärin der Bayerischen Akademie der Wissenschaften
        </p>
      </section>
      <section>
        <h3>Nutzungsrechte</h3>
        <address>
          © Bayerische Akademie der Wissenschaften <br />
          Alfons-Goppel-Str. 11 <br />
          80539 München <br />
        </address>
        <p>
          Alle Rechte vorbehalten. <br />
          Die Urheberrechte dieser Web-Site liegen vollständig bei der
          Bayerischen Akademie der Wissenschaften.
        </p>
        <p>
          Bildmotive dürfen nur für redaktionelle Zwecke genutzt werden. Die
          Verwendung ist honorarfrei bei Quellenangabe und Übersendung von zwei
          kostenlosen Belegexemplaren an die Bayerische Akademie der
          Wissenschaften in München. Grafische Veränderungen – außer zum
          Freistellen des Hauptmotivs – sind nicht gestattet.
        </p>
        <p>
          Es ist hiermit ausdrücklich gestattet – unter Maßgabe untenstehender
          Einschränkungen – diese Web-Seiten sowie darin eingehängte Dokumente
          zu kopieren, zu drucken und zu verteilen, soweit sie jedermann frei
          zugänglich sind.
        </p>
        <ul>
          <li>
            Die hier zur Verfügung gestellten Web-Seiten und Dokumente dürfen
            nur zu Informationszwecken verwendet werden.
          </li>
          <li>
            Diese Seiten und Dokumente dürfen nicht kommerziell verwertet
            werden.
          </li>
          <li>
            Jede Kopie (dies gilt auch für Auszüge) muss diesen
            Urheberrechtsnachweis enthalten.
          </li>
        </ul>
        <p>
          Forschungsprojekte und Institute, die mit eigenen Seiten im Internet
          vertreten sind, benennen ihre jeweils inhaltlich und technisch
          Verantwortlichen (Impressum).
        </p>
        <p>
          Alle innerhalb des Internetangebotes genannten und ggf. durch Dritte
          geschützten Marken- und Warenzeichen unterliegen uneingeschränkt den
          Bestimmungen des jeweils gültigen Kennzeichenrechts und den
          Besitzrechten der jeweiligen eingetragenen Eigentümer. Allein aufgrund
          der bloßen Nennung in unserem Internetangebot ist nicht der Schluss zu
          ziehen, dass Markenzeichen nicht durch Rechte Dritter geschützt sind.
        </p>
      </section>
      <section>
        <h3>Haftungsausschluss</h3>
        <p>
          Die Bayerische Akademie der Wissenschaften hat alle in ihrem Bereich
          bereitgestellten Informationen nach bestem Wissen und Gewissen
          erarbeitet und geprüft. Es wird jedoch keine Gewähr für die
          Aktualität, Richtigkeit, Vollständigkeit oder Qualität und
          jederzeitige Verfügbarkeit der bereit gestellten Informationen
          übernommen. Unbeschadet der Regelungen des § 675 Absatz 2 BGB gilt für
          das bereitgestellte Informationsangebot folgende Haftungsbeschränkung:
        </p>
        <p>
          Die Bayerische Akademie der Wissenschaften und ihre Bediensteten
          haften nicht für Schäden, die durch die Nutzung oder Nichtnutzung der
          im Internetangebot der Akademie angebotenen Informationen entstehen.
        </p>
        <p>
          Für etwaige Schäden, die beim Aufrufen oder Herunterladen von Daten
          durch Computerviren oder der Installation oder Nutzung von Software
          verursacht werden, wird nicht gehaftet.
        </p>
        <p>
          Namentlich gekennzeichnete Internetseiten geben die Auffassungen und
          Erkenntnisse der abfassenden Personen wieder.
        </p>
        <p>
          Die Bayerische Akademie der Wissenschaften behält es sich ausdrücklich
          vor, einzelne Webseiten oder das gesamte Angebot ohne gesonderte
          Ankündigung zu verändern, zu ergänzen, zu löschen oder die
          Veröffentlichung zeitweise oder endgültig einzustellen.
        </p>
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
          sind ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>
      <section>
        <h3>Datenschutz</h3>
        <p>
          Der Web-Server der Bayerischen Akademie der Wissenschaften wird durch
          das Leibniz-Rechenzentrum, Boltzmannstraße 1, D-85748 Garching,
          betrieben.
        </p>
        <p>
          Allgemeines zum Thema Datenschutz ist auf den Web-Seiten des
          Bayerischen Landesbeauftragten für den Datenschutz zu finden.
        </p>
        <p>
          Siehe auch die ausführlichere{' '}
          <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
      </section>
      <section>
        <h3>Netiquette</h3>
        <p>
          Wir laden Sie herzlich ein, unsere Social Media Angebote aktiv zu
          nutzen, Inhalte zu teilen, zu kommentieren und sich mit Beiträgen an
          Diskussionen zu beteiligen. Wir bitten Sie dabei jedoch um die
          Einhaltung unserer hier beschriebenen Grundsätze. Mit der Interaktion
          auf unseren Social Media-Kanälen erkennen Sie diese Grundsätze an. Wir
          behalten uns vor, abweichende Inhalte zu löschen, an die jeweiligen
          Plattformbetreiber zu melden und Nutzerinnen und Nutzer zu blockieren.
        </p>
        <p>
          Respektvoller Umgang: wir bitten um Beiträge in einem fairen und
          sachlichen Ton ohne Beleidigungen gegen andere, rassistische,
          antisemitische, volksverhetzende, pornografische, hetzerische,
          jugendgefährdende, homophobe, oder sexistische Inhalte. Derartige
          Beiträge werden von uns gelöscht und gegebenenfalls an die jeweiligen
          Plattformbetreiber gemeldet. Dasselbe gilt für Beiträge, die in
          vulgärer, missbräuchlicher oder hasserfüllter Sprache verfasst sind
          oder das Recht Dritter sowie Urheberrechte verletzen. Wir behalten uns
          vor, in bestimmten schweren Fällen, z.B. bei der Androhung einer
          gefährlichen Körperverletzung oder der Billigung noch nicht erfolgter
          Straftaten, dies an die zuständigen Behörden zu melden.
        </p>
        <p>
          Themenbezug: Wir bitten um Diskussionsbeiträge, die sich auf das
          jeweilige Thema des Beitrags beziehen, andernfalls behalten wir uns
          vor, Beiträge zu löschen.
        </p>
        <p>
          Missbräuchliche Nutzung: Die missbräuchliche Nutzung unserer Social
          Media-Kanäle als Werbeflächen oder das kommerzielle oder private
          Anbieten von Waren und Dienstleistungen ist nicht gestattet. Solche
          Beiträge werden gelöscht und führen ggf. zur Blockierung. Auch
          Inhalte, Informationen, Software oder anderes Material, das gegen
          bestehende Gesetze verstößt, dürfen nicht gepostet werden.
        </p>
        <p>
          Zitate, Bilder und Links: Bei Zitaten nennen Sie bitte auch die Quelle
          und Urheberinnen resp. Urheber. Zitate und Quellenangaben sollten für
          andere nachvollziehbar und nachprüfbar sein. Beachten Sie beim Posten
          von Inhalten und Bildern das Urheber- und Nutzungsrecht. Verlinkungen
          zu externen Webseiten sollten sparsam eingesetzt werden.
        </p>
        <p>
          Verantwortung: Wir übernehmen keine Verantwortung für die Beiträge der
          Nutzerinnen und Nutzer auf unseren Plattformen, diese liegt bei der
          jeweiligen Person selbst.
        </p>
        <p>
          Neben der Löschung von Beiträgen, Meldung an die Plattformbetreiber
          und Blockierung von Accounts können Verstöße gegen die allgemeinen
          Gesetze und Rechtsvorschriften unter Umständen auch zum Ausschluss aus
          der jeweiligen Plattform führen und in schwerwiegenden Fällen die
          Einleitung rechtlicher Schritte zur Folge haben.
        </p>
      </section>
    </AppContent>
  )
}
