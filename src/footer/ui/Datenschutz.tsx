import AppContent from 'common/ui/AppContent'
import { TextCrumb } from 'common/ui/Breadcrumbs'
import React from 'react'
import DatenschutzThirdPartiesAndRights from 'footer/ui/DatenschutzThirdPartiesAndRights'

export default function Datenschutz(): JSX.Element {
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
        </p>
        <ul>
          <li>IP-Adresse des anfragenden Rechners</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name, URL und übertragene Datenmenge der abgerufenen Datei</li>
          <li>
            Zugriffsstatus (angeforderte Datei übertragen, nicht gefunden etc.)
          </li>
          <li>
            Erkennungsdaten des verwendeten Browsers und Betriebssystems (sofern
            vom anfragenden Webbrowser übermittelt)
          </li>
          <li>
            Netzseite, von der aus der Zugriff erfolgte (sofern vom anfragenden
            Webbrowser übermittelt)
          </li>
        </ul>
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
      <DatenschutzThirdPartiesAndRights />
    </AppContent>
  )
}
