import AppContent from 'common/AppContent'
import { TextCrumb } from 'common/Breadcrumbs'
import React, { useEffect } from 'react'

export default function Datenschutz({
  pathname,
}: {
  pathname: string
}): JSX.Element {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <AppContent
      title="Datenschutzerklärung"
      crumbs={[new TextCrumb('Datenschutz')]}
    >
      <section>
        <p>
          Die Webserver der Bayerischen Akademie der Wissenschaften (BAdW) und
          des Leibniz-Rechenzentrums (LRZ) werden vom LRZ, Boltzmannstraße 1,
          85748 Garching bei München, betrieben. Die dabei verarbeiteten
          personenbezogenen Daten unterliegen den geltenden
          datenschutzrechtlichen Bestimmungen, insbesondere dem Bayerischen
          Datenschutzgesetz (BayDSG) und dem Telemediengesetz (TMG).
        </p>
        <p>
          Im Sinne der EU-Datenschutz-Grundverordnung verantwortlich für die
          Verarbeitung der Daten ist die Bayerische Akademie der Wissenschaften,
          Alfons-Goppel-Str. 11, 80539 München (
          <a href="/impressum">Impressum</a>).
        </p>
        <p>
          Kontakt zum{' '}
          <a href="https://badw.de/die-akademie/organisation-verwaltung.html#c3532">
            Datenschutzbeauftragten
          </a>{' '}
          (<a href="mailto:datenschutz@badw.de">E-Mail</a>).
        </p>
        <p>
          Nachfolgend informieren wir Sie über Art, Umfang und Zweck der
          Erhebung und Verwendung personenbezogener Daten. Diese Informationen
          können jederzeit in ihrer aktuellen Fassung von unserer Netzseite
          abgerufen werden.
        </p>
      </section>
      <section>
        <h3>Abruf von Netzseiten</h3>
        <p>
          Bei einem Zugriff auf eine Seite oder Unterseite der badw.de speichert
          der Webserver temporär die folgenden Informationen:
          <ul>
            <li>IP-Adresse des anfragenden Rechners</li>
            <li>Datum und Uhrzeit des Zugriffs</li>
            <li>Name, URL und übertragene Datenmenge der abgerufenen Datei</li>
            <li>
              Zugriffsstatus (angeforderte Datei übertragen, nicht gefunden
              etc.)
            </li>
            <li>
              Erkennungsdaten des verwendeten Browsers und Betriebssystems
              (sofern vom anfragenden Webbrowser übermittelt)
            </li>
            <li>
              Netzseite, von der aus der Zugriff erfolgte (sofern vom
              anfragenden Webbrowser übermittelt)
            </li>
          </ul>
        </p>
        <p>
          Diese Einträge werden kontinuierlich automatisch ausgewertet, um
          Angriffe auf die Webserver erkennen und entsprechend reagieren zu
          können. In Einzelfällen, d.h. bei gemeldeten Störungen, Fehlern und
          Sicherheitsvorfällen, erfolgt eine manuelle Analyse. Die
          Rechtsgrundlage ergibt sich aus der Pflicht zur IT-Sicherheit einer
          Webseite nach § 13 Abs. 7 TMG sowie aus der allgemeinen Pflicht und
          staatlichen Aufgabe zur IT-Sicherheit nach Art. 11 Abs. 1 S. 1
          BayEGovG.
        </p>
        <p>
          Einträge, die älter als sieben Tage sind, werden durch Kürzung der
          IP-Adresse anonymisiert. Die anonymisierten Daten werden zur
          Erstellung von Zugriffsstatistiken verwendet. Die hierfür eingesetzte
          Software wird lokal vom LRZ betrieben.
        </p>
        <p>
          Die in den Einträgen enthaltenen IP-Adressen werden nicht mit anderen
          Datenbeständen zusammengeführt, so dass keine Rückschlüsse auf
          einzelne Personen möglich ist.
        </p>
        <p>
          Auf den Netzseiten der Forschungsvorhaben der BAdW und in über das
          Internet nutzbaren Anwendungen der Forschungsvorhaben der BAdW können
          Sitzungskennungen (sogenannte „Session-Cookies“) eingesetzt werden.
          Die Sitzungskennungen dienen lediglich der Bereitstellung der auf
          diesen Seiten gebotenen Funktionen und werden nicht zu einer
          Nachverfolgung des Nutzerverhaltens eingesetzt.
        </p>
      </section>
      <section>
        <h3>Auswertung thematischer Schwerpunkte</h3>
        <p>
          Es ist unser berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO
          zur Verbesserung unseres Informationsangebots die Themen zu erkennen,
          die für die Besucher unserer Netzseiten von besonderem Interesse sind.
          Dazu setzen wir auf unseren Servern als Werkzeug Matomo ein. Es werden
          dieselben Datenkategorien wie im Abschnitt „Abruf von Netzseiten”
          erhoben, wobei die IP-Adresse vor der Auswertung anonymisiert wird.
          Wir setzen Matomo in der Weise ein, dass ein Besucher unseres
          Webangebotes nur während einer bestimmten Zeitspanne von aktuell einer
          halben Stunde identifizierbar ist. Matomo führt statistische Analysen
          aus, welche unserer Webseiten dieser Benutzer aufruft. Auf Basis
          dieser Auswertungen können wir zum Beispiel erkennen, welche Themen
          häufiger als andere abgerufen oder auch welche Angebote wie angenommen
          werden.
        </p>
        <p>
          Matomo respektiert die Einstellungen Ihres Browsers, mit denen Sie
          jede Art der Nutzernachverfolgung grundsätzlich untersagen können. Ein
          weiteres Profiling als dieses mit Matomo findet nicht statt. Es werden
          keine Daten an Dritte übermittelt.
        </p>
      </section>
      <section>
        <h3>Newsletter</h3>
        <p>
          Melden Sie sich für unseren Newsletter an, verwenden wir die von Ihnen
          eingegebenen Daten ausschließlich für diesen Zweck und um sie über die
          für diesen Dienst oder die für die Registrierung relevanten
          Sachverhalte zu informieren. Für den Empfang des Newsletters bedarf es
          einer gültigen E-Mail-Adresse. Gespeichert werden zudem die
          IP-Adresse, über die Sie sich für den Newsletter anmelden und das
          Datum mit Uhrzeit, an dem Sie den Newsletter bestellen. Um
          sicherzustellen, dass eine E-Mail-Adresse nicht missbräuchlich durch
          Dritte in unseren Verteiler eingetragen wird, arbeiten wir
          gesetzeskonform mit dem sogenannten Double-Opt-In-Verfahren. Im Rahmen
          dieses Verfahrens werden die Bestellung des Newsletters, der Versand
          der Bestätigungsmail und der Erhalt der Anmeldebestätigung
          protokolliert. Diese Daten dienen als Nachweis Ihrer Einwilligung.
          Ihre Einwilligung ist die Rechtsgrundlage für diese Datenerhebung nach
          Art. 6 Abs. 1 lit a DSGVO. Mit der Nutzung unseres Newsletters werden
          keine Daten erhoben, die eine Nutzernachverfolgung oder andere
          statistische Auswertungen ermöglichen.
        </p>
        <p>
          Zum Versand des Newsletters wird der Newsletter-Dienst der
          Newsletter2Go GmbH (
          <a href="https://www.newsletter2go.de">
            https://www.newsletter2go.de
          </a>
          ) verwendet. Dabei werden Ihre Daten an die Newsletter2Go GmbH,
          Köpenicker Str. 126, 10179 Berlin, übermittelt. Unser
          Auftragsverarbeiter Newsletter2Go ist ein zertifizierter Anbieter,
          welcher nach den Anforderungen der EU-Datenschutz-Grundverordnung und
          des Bundesdatenschutzgesetzes seine Dienste erbringt. Weitere
          Informationen finden Sie unter{' '}
          <a href="https://www.newsletter2go.de/informationen-newsletter-empfaenger/">
            https://www.newsletter2go.de/informationen-newsletter-empfaenger/
          </a>
        </p>
        <p>
          Sie haben jederzeit die Möglichkeit, Ihre Einwilligung zur Speicherung
          Ihrer Daten und deren Nutzung für den Newsletter-Versand zu
          widerrufen. Für den Widerruf stellen wir Ihnen in jedem Newsletter und
          <a href="https://badw.de/die-akademie/presse/newsletter/abmeldung.html">
            auf der Webseite
          </a>{' '}
          einen Link zur Verfügung. Sie haben außerdem die Möglichkeit, uns
          Ihren Widerrufswunsch direkt an die E-Mail-Adresse{' '}
          <a href="mailto:presse@badw.de">presse@badw.de</a>
          mitzuteilen.
        </p>
      </section>
      <section>
        <h3>Social Media und externe Dienstleister</h3>
        <p>
          Sofern auf unseren Webseiten Social Media Icons von Facebook, Twitter,
          LinkedIn u.a. eingesetzt werden, erfolgt keine Weitergabe von
          personenbezogenen Daten. Zur Vermeidung von automatischer
          Datenübertragung wird auf diese Anbieter per URL verwiesen. Aus
          datenschutzrechtlichen Gründen werden keine aktiven Social Media
          Plugins verwendet.
        </p>
        <p>
          Unsere Social Media-Auftritte sind Teil unserer Öffentlichkeitsarbeit.
          Unser Bestreben ist es, zielgruppengerecht zu informieren.
        </p>
        <p>
          Durch die Einwilligung zur Verwendung unserer Social-Media-Kanäle
          erklären sie sich bereit, dass Informationen an den Anbieter dieses
          Dienstes offengelegt und möglicherweise in die USA übermittelt werden.
          Zu den verarbeiteten Daten können insbesondere IP-Adressen und
          Standortdaten der Nutzer gehören. Mit diesen Informationen kann der
          Anbieter ihr Verhalten analysieren und nutzt die Ergebnisse
          gegebenenfalls, um personalisierte Werbung anzuzeigen und zu
          vermarkten. Es gibt aktuell keinen Beschluss der EU-Kommission, dass
          die USA allgemein ein angemessenes Datenschutzniveau bieten. Sie
          willigen zugleich gem. Art. 49 Abs. 1 S. 1 lit. a) DSGVO in das Risiko
          ein, dass auf ihre Daten durch US-Behörden in geheimer Weise oder zur
          Nutzung zu Überwachungszwecken zugegriffen wird. Ein Rechtsbehelf
          gegen diese Verarbeitung ist nicht gesichert. Die Nutzung der Funktion
          unterliegt Bedingungen und Richtlinien des Anbieters.Soweit Sie unsere
          Social Media-Kanäle nutzen, werden durch uns keine personenbezogenen
          Daten oder Protokolldaten erhoben. Allerdings verarbeiten deren
          Anbieter Ihre personenbezogen Daten. Die Nutzung von Angeboten auf
          Social Media-Plattformen erfolgt freiwillig und in Kenntnis der
          jeweiligen Datenschutzbestimmungen.
        </p>
        <p>
          Zweck, Umfang und Nutzung der von diesen Netzwerken erhobenen Daten
          sowie die Rechte und Einstellungsmöglichkeiten zum Schutz Ihrer
          Privatsphäre entnehmen Sie bitte den jeweiligen Datenschutzrichtlinien
          der Betreiber:
        </p>

        <p>
          X (ehem. Twitter):{' '}
          <a href="https://twitter.com/de/privacy">
            https://twitter.com/de/privacy
          </a>
        </p>
        <p>
          Facebook:{' '}
          <a href="https://www.facebook.com/full_data_use_policy">
            https://www.facebook.com/full_data_use_policy
          </a>
        </p>
        <p>
          Die BAdW nutzt für ihren Podcast &quot;BAdW-Cast&quot; – neben der{' '}
          <a href="https://badw.de/die-akademie/presse/podcast/">
            eigenen Podcast-Seite
          </a>{' '}
          – die externen Anbieter itunes und Spotify. Wenn Sie das Angebot von
          itunes oder Spotify durch Klick auf die Links nutzen, erfolgt die
          Datenverarbeitung beim jeweiligen Anbieter. Eine Datenverarbeitung
          durch die BAdW findet nicht statt. Weitere Informationen finden Sie in
          der Datenschutzerklärung von
        </p>
        <p>
          Apple (itunes):{' '}
          <a href="https://www.apple.com/legal/privacy/en-ww/">
            https://www.apple.com/legal/privacy/en-ww/
          </a>
        </p>
        <p>
          Spotify:{' '}
          <a href="https://www.spotify.com/de/legal/privacy-policy/">
            https://www.spotify.com/de/legal/privacy-policy/
          </a>
        </p>
      </section>
      <section>
        <h3>Anmelde- und Kontaktformulare</h3>
        <p>
          Personenbezogene Daten, die Sie gegebenenfalls über Kontaktformulare,
          Anmeldeformulare und Ähnliches über unsere Netzseiten an uns leiten,
          werden nur mit Ihrem Einverständnis entgegengenommen und dienen
          ausschließlich dem in den Formularen genannten Zweck.
        </p>
        <p>
          Zu diesem Zweck wird die entgegennehmende Stelle (z.B. die
          Presseabteilung oder das Sekretariat) ggf. Ihre E-Mail an die
          entsprechenden Ansprechpartner in der Akademie weiterleiten. Die mit
          Ihrer Anfrage an uns übermittelten Daten werden nach Erledigung Ihrer
          Anfrage sowohl in der Presseabteilung als auch bei allen anderen
          Kontaktpersonen von unseren Rechnern gelöscht.
        </p>
        <p>
          Sofern Sie forschungsrelevante Anfragen an uns richten, so gehen diese
          inklusive unserer Antworten eventuell in die Forschungsdaten des
          entsprechenden Projekts ein und werden dort dauerhaft gespeichert.
        </p>
      </section>
      <section>
        <h3>Weitergabe personenbezogener Daten</h3>
        <p>
          Die Übermittlung personenbezogener Daten an staatliche Einrichtungen
          und Behörden erfolgt nur im Rahmen zwingender nationaler
          Rechtsvorschriften oder wenn die Weitergabe im Fall von Angriffen auf
          unsere IT-Infrastruktur zur Rechts- oder Strafverfolgung erforderlich
          ist. Eine Weitergabe zu anderen Zwecken an Dritte oder eine
          Veröffentlichung finden nicht statt.
        </p>
      </section>
      <section>
        <h3>Ihre Rechte</h3>
        <p>
          Sie haben ein Auskunftsrecht über Ihre bei uns gespeicherten
          personenbezogenen Daten, auf Berichtigung unrichtiger Daten sowie
          Löschung, Einschränkung der Verarbeitung und gegebenenfalls
          Datenübertragbarkeit.
        </p>
        <p>
          Wenn Sie diese Rechte wahrnehmen möchten, wenden Sie sich bitte
          schriftlich an die Leitung der Akademie oder den
          Datenschutzbeauftragten.
        </p>
        <p>
          Wenn Sie eine Beschwerde haben, können Sie sich auch an eine
          Aufsichtsbehörde Ihrer Wahl wenden. Die für uns zuständige
          Aufsichtsbehörde ist der Bayerische Landesbeauftragte für Datenschutz,
          Postfach 221219, 80502 München, sowie erreichbar unter{' '}
          <a href="https://www.datenschutz-bayern.de">
            https://www.datenschutz-bayern.de
          </a>
          .
        </p>
      </section>
      <section>
        <h3>Links</h3>
        <p>
          Unsere Netzseiten enthalten zum Teil Verweise (Links) auf Netzseiten
          anderer Organisationen und Privatpersonen. Auf die Gestaltung und die
          Inhalte dieser Netzseiten haben wir keinen Einfluss, und wir können
          nicht kontrollieren, wie deren Anbieter mit Ihren personenbezogenen
          Daten umgehen.
        </p>
      </section>
      <section>
        <h3>Gültigkeit und Aktualität</h3>
        <p>
          Diese Datenschutzerklärung ist unmittelbar gültig und ersetzt alle
          früheren Erklärungen.
        </p>
        <p>
          Durch die Weiterentwicklung unserer Netzseiten kann es notwendig
          werden, diese Datenschutzerklärung zu überarbeiten. Wir behalten uns
          vor, die Datenschutzerklärung jederzeit mit Wirkung für die Zukunft zu
          ändern, und empfehlen Ihnen, sich die jeweils aktuelle
          Datenschutzerklärung von Zeit zu Zeit erneut durchzulesen.
        </p>
        <p>Letzter Stand dieser Datenschutzerklärung: 12.12.2019</p>
      </section>
    </AppContent>
  )
}
