import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../app/App";

describe("App", () => {
  it("renders the Preeti converter as the primary tab", () => {
    render(<App />);
    expect(screen.getByRole("tab", { name: /preeti/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText(/Preeti text/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("नमस्ते")).toBeInTheDocument();
  });

  it("renders Romanized editor and suggestions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Romanized$/i }));
    expect(screen.getByLabelText(/Romanized input/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/NID form को नाम field/)).toBeInTheDocument();
  });

  it("renders Traditional reference without creating a typing engine", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /^Traditional$/i }));
    expect(screen.getByText(/reference-only/i)).toBeInTheDocument();
    expect(screen.getByText("क्ष")).toBeInTheDocument();
  });
});
