import React from 'react'
import { Markdown } from 'common/Markdown'
import { KingsCollection, getDynasty } from './BrinkmanKings'
import { Table } from 'react-bootstrap'
import KingsService from 'chronology/application/KingsService'
import withData from 'http/withData'

function BrinkmanKingsTable({
  kingsCollection,
}: {
  kingsCollection: KingsCollection
}): JSX.Element {
  return (
    <Table className="table-borderless chronology-display">
      <tbody>
        {kingsCollection.dynasties.map((dynastyName, index) =>
          getDynasty(dynastyName, index, kingsCollection.kings, true)
        )}
      </tbody>
    </Table>
  )
}

const BrinkmanKingsTableWithData = withData<
  unknown,
  {
    kingsService: KingsService
  },
  { kingsCollection: KingsCollection }
>(
  (props) => {
    return <BrinkmanKingsTable kingsCollection={props.data.kingsCollection} />
  },
  (props) =>
    props.kingsService.fetchAll().then((kings) => ({
      kingsCollection: new KingsCollection(kings),
    }))
)

export default function AboutListOfKings(
  kingsService: KingsService
): JSX.Element {
  return (
    <>
      <Markdown
        text="The list of kings presented here has been prepared by John A.
              Brinkman. It is the eighth edition of the chronology first published
              as an appendix to A. L. Oppenheim’s *Ancient Mesopotamia* (1964).
              The principal new feature of this edition is the recalculation of
              late-second-millennium dates deriving from the Middle Assyrian lunar
              calendar and the corresponding recalibration of synchronistic
              Babylonian dates, which were based on a lunar-solar calendar,
              including their relationship with a set of known intercalary months
              from the fourteenth and thirteenth centuries. This presentation
              reflects research current in January 2023."
      />
      <BrinkmanKingsTableWithData kingsService={kingsService} />
    </>
  )
}
