import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreatorForm } from "@/components/creators/creator-form";

describe("CreatorForm", () => {
  it("shows a validation error and does not submit when the name is missing", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreatorForm submitLabel="Criar Creator" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Criar Creator" }));

    expect(await screen.findByText(/at least 2 character/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the expected payload once required fields are valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreatorForm submitLabel="Criar Creator" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nome"), "Fulano da Silva");
    await user.type(screen.getByLabelText("Nickname"), "fulaninho");
    await user.click(screen.getByRole("button", { name: "Criar Creator" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: "Fulano da Silva",
      nickname: "fulaninho",
      status: "ACTIVE",
      tags: [],
    });
  });

  it("parses the comma-separated tags field into an array", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreatorForm submitLabel="Criar Creator" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nome"), "Ciclana");
    await user.type(screen.getByLabelText(/Tags/), "vip, streamer,  cassino ");
    await user.click(screen.getByRole("button", { name: "Criar Creator" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]?.tags).toEqual(["vip", "streamer", "cassino"]);
  });
});
