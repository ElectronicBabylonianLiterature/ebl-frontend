import { Text } from 'transliteration/domain/text'
import { commentaryProtocols } from 'test-support/lines/text-commentary-protocols'
import * as at from 'test-support/lines/at'
import * as columns from 'test-support/lines/text-columns'
import * as normalized from 'test-support/lines/text-normalized'
import * as greek from 'test-support/lines/text-greek'
import * as composite from 'test-support/lines/composite'
import * as control from 'test-support/lines/control'
import * as dollar from 'test-support/lines/dollar'
import empty from 'test-support/lines/empty'
import note from 'test-support/lines/note'
import line2 from 'test-support/lines/text-line'
import * as parallel from 'test-support/lines/parallel'
import line4 from 'test-support/complex-text/line4'
import line6 from 'test-support/complex-text/line6'
import line7 from 'test-support/complex-text/line7'
import line8 from 'test-support/complex-text/line8'
import line10 from 'test-support/complex-text/line10'
import line11 from 'test-support/complex-text/line11'
import line12 from 'test-support/complex-text/line12'
import line13 from 'test-support/complex-text/line13'
import line14 from 'test-support/complex-text/line14'
import line15 from 'test-support/complex-text/line15'
import line16 from 'test-support/complex-text/line16'
import line17 from 'test-support/complex-text/line17'
import line18 from 'test-support/complex-text/line18'

const complexTestText = new Text({
  lines: [
    at.surface,
    at.object,
    at.heading,
    at.division,
    at.discourse,
    at.seal,
    composite.composite,
    composite.division,
    composite.end,
    composite.locator,
    line2,
    dollar.singleRuling,
    line4,
    dollar.doubleRuling,
    line6,
    note,
    line7,
    line8,
    dollar.tripleRuling,
    line10,
    line11,
    line12,
    line13,
    line14,
    line15,
    line16,
    line17,
    line18,
    columns.emptyFirstColumn,
    columns.implicitFirstColumn,
    columns.firstColumnSpan,
    empty,
    commentaryProtocols,
    dollar.state,
    dollar.image,
    dollar.loose,
    dollar.seal,
    control.comment,
    normalized.akkadianWords,
    normalized.breaks,
    greek.greek,
    greek.akkadian,
    greek.sumerian,
    parallel.fragment,
    parallel.text,
    parallel.composition,
  ],
})

export default complexTestText
