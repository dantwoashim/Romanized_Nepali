import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../app/App";

describe("App", () => {
  it("renders the Preeti converter as the primary tab", async () => {
    render(<App />);
    expect(screen.getByRole("tab", { name: /preeti/i })).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByLabelText(/Preeti text/i, {}, { timeout: 8000 })).toBeInTheDocument();
    expect(await screen.findByDisplayValue("नमस्ते", {}, { timeout: 8000 })).toBeInTheDocument();
  });

  it("renders Romanized editor and suggestions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Romanized$/i }));
    expect(await screen.findByLabelText(/Romanized input/i)).toBeInTheDocument();
    expect(await screen.findByDisplayValue(/NID form को नाम field/)).toBeInTheDocument();
  });

  it("applies a suggestion by replacing only the current romanized token", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Romanized$/i }));
    const input = await screen.findByLabelText(/Romanized input/i);
    await user.clear(input);
    await user.type(input, "mero pra");
    const [suggestion] = await screen.findAllByRole("button", { name: /प्रशासन/i });
    await user.click(suggestion);
    expect(input).toHaveValue("mero prashasan");
    expect(screen.getByDisplayValue("मेरो प्रशासन")).toBeInTheDocument();
  });

  it("applies romanized candidates as full-output alternatives", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Romanized$/i }));
    const input = await screen.findByLabelText(/Romanized input/i);
    await user.clear(input);
    await user.type(input, "niraj bhusal");
    await user.click(screen.getByRole("button", { name: /नीरज भुसाल/i }));

    expect(screen.getByDisplayValue("नीरज भुसाल")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("नीरज")).not.toBeInTheDocument();
  });

  it("updates the feedback draft with the latest reported tool output", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Romanized$/i }));
    const input = await screen.findByLabelText(/Romanized input/i);
    await user.clear(input);
    await user.type(input, "Thapa");
    await user.click(screen.getByRole("button", { name: /report bad typing/i }));

    expect(screen.getByLabelText(/Actual output/i)).toHaveValue("थापा");
  });

  it("renders Traditional reference without creating a typing engine", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Traditional$/i }));
    expect(await screen.findByText(/not a full Traditional key map/i)).toBeInTheDocument();
    expect(await screen.findByText("क्ष")).toBeInTheDocument();
  });
});
