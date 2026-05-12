import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchFormGenre from "./SearchFormGenre";
import { genres } from "fragmentarium/domain/Genres";

describe("SearchFormGenre", () => {
  const onChange = jest.fn();

  it("displays truncated labels for long genre paths", () => {
    const longGenre = "Category → SubCategory → Detail";
  });

  it("calls onChange with array of values", async () => {
    render(<SearchFormGenre value={[]} onChange={onChange} />);

    const input = screen.getByLabelText("Genre");

    await userEvent.type(input, "Non defined");
    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(["Non defined"]);

    await userEvent.type(input, "Literature");
    await userEvent.keyboard("{Enter}");
  });
});
