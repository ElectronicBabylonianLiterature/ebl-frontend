import React from 'react'
import { Markdown } from 'common/Markdown'
import BrinkmanKingsTable from 'common/BrinkmanKings'

export default function AboutChronology(): JSX.Element {
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
      <BrinkmanKingsTable />
    </>
  )
}
