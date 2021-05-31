import React from 'react'
import { render, screen } from '@testing-library/react'
import MesZL from 'signs/ui/search/MesZL'
import MesZlContent from 'signs/ui/search/MesZLContent'
import userEvent from '@testing-library/user-event'

const mesZl = `121	**BAR**	𒁇
ASy 48. Lww. bar (allg.); pár (allg.).
  Statt Lw. war (ass.-a.) lieber, wie von Hecker, OLZ 65 144f. erwogen, einfach bar zu umschreiben (ebenso in CAD A/II 286ff.; der altassyr. Monatsname lautet nicht *tan-war-ta*, sondern *kán-bar-ta*, cf Donbaz, JCS 24 26b Mitte [und AHw 1320a]). Statt *war-ḫaṣ* (bab.-n.) liest CAD M/I 385a vielmehr *maš-qut*.
Der nach Thureau-D., Homophones 43 für KAR 152 2f. vorgeschlagene Lw. “pàra” (hätte pára lauten müssen) wird in CAD N/I 285a Mitte angezweifelt.
---
  bar = *aḫû*, fremd. bar-*tum* usw. = *aḫī-tum*, Unheil; nach CAD A/I 192b oben auch *uššur-tum* (?? nicht in AHw 1498b).
bar = *bêru*, auswählen.
  bar = *kam/wû* in *bābu kam/wû*, Aussentür (Maqlû IX 95 [erweitert] und 130). Siehe CAD K 126f.
BAR(? oder n869 ŠÚ?) = *kidennu*, Privileg, Schutz (N.P.; CAD K 343b oben, Brinkman, OrNS 42 316f., Saporetti, Onomastica II 130f., Heessel, NABU 2002 n62).
bar = *mišlu* siehe n120.
  bar = *pa/il*(*l*)*urtu*, <span style="color: #00610F;">*išpa/il*(*l*)*urtu*</span>, Kreuz, Kreuzweg (CAD I/J 253 und AHw 396b + 1564a unten, Reiner, Fs. Güterbock 65 [1974] 258f., Nougayrol, Fs. Kramer [AOAT 25] 346 mit Anm. 44, Borger. BIWA 269 38). Die CAD I/J 253b oben vorgeschlagene haplographische Emendation der Textstelle Zimmern, ZA 32 174 62 zu *epir* <*iš*>-*pal*(var. -*pa*)-*lu-ur-ti* trifft nicht zu; Ebeling, RA 49 182 Rs. 10 hatte die Textstelle bereits richtig gelesen, und in AHw 396b unten hat vSoden die Lesung von Ebeling akzeptiert. Merkwürdigerweise hat vSoden, AHw 1564a übersehen, dass an der Textstelle Gadd, Iraq 28, 110, 23 = UET 6/II 394 23 statt *iš-pal-lu-ur-ti* vielmehr *eper pal-lu-ur-ti* zu lesen ist. Vgl. auch unten 750 LAL = *išpalurtu*. Black + George + Postgate, CDA 134a Mitte ist dementsprechend zu berichtigen.
bar = *qilpu*, Schale; *qalpu*, geschält (Thureau-D., RAcc 145 454 !); *qulēptu*, Schuppenhaut.
bar = (*w/m*)*uššuru*, loslassen.
bar = *zâzu*, verteilen (cf Nougayrol, RA 62 46ff.).
𒁇𒉣 = bar-nun = *ṣiliptu*, Diagonale (Thureau-D., TMB p233, CAD Ṣ 188, Hirsch, AfO 34 52f.).
(^túg^)𒁇𒋛 = bar-si = *paršigu*, Kopfbinde.
𒁇𒁯𒁯𒈾 = bar-gùn-gùn-na = *ḫurbabillu*, Chamäleon^?^ (AHw 358a, CAD Ḫ 248).
^udu^𒁇𒃲 = BAR-GAL = *parru*, Lamm. CAD P 183f. liest *pargallu*.
(^giš^)𒁇𒄯 = bar-kín siehe CAD S 238f. siḫpu.
^túg^𒁇􀀀/𒌆/𒁳 = bar-dul/dul₅(TÚG)/dul₈(DIB) = *kusītu*, Gewand (CAD K 585ff., AHw 514b, PSD B 119ff., Gurney, AfO 28 97 237f. [= AfO 18 330 237f.], Aro, BSAW 115/II p26, Limet, RA 65 16, Sollberger, BAC p104 n98). Man darf nicht (wie z.B. CAD K) ausser TÚG auch DIB als dul₅ umschreiben. Wenn man nicht (mit AHw) bar-dib und dementsprechend bar-díb umschreiben will, kommt man um den Lw. DIB = dul₈ nicht herum, der freilich in Vokabularen nicht vorkommt.
^udu^𒁇𒊩 = BAR-MUNUS = *parratu*, weibliches Lamm. CAD <span style="color: #00610F;">P</span> 192b liest *parsallu*.
^túg^𒁇𒋝 = bar-sig = *paršigu*, Kopfbinde.`

const mesZlNumber = '121'

describe('MesZl', () => {
  it('MesZl Button', async () => {
    render(<MesZL mesZl={mesZl} mesZlNumber={mesZlNumber} />)
    await screen.findByText(`MesZL ${mesZlNumber}`)
    userEvent.click(screen.getByRole('button'))
    await screen.findByText(
      'Mesopotamisches Zeichenlexikon, Zweite revidierte und aktualisiert Auflage'
    )
  })
  it('MesZl Content', async () => {
    const { container } = render(<MesZlContent mesZl={mesZl} />)
    await screen.findByText(
      'Mesopotamisches Zeichenlexikon, Zweite revidierte und aktualisiert Auflage'
    )
    expect(container).toMatchSnapshot()
  })
})
