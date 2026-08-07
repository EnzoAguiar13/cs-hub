import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { CreatorTable } from "@/components/creators/creator-table";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/creators",
  useSearchParams: () => new URLSearchParams(),
}));

function creatorFixture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "creator_1",
    photoUrl: null,
    name: "Fulano da Silva",
    nickname: "fulaninho",
    status: "ACTIVE",
    category: "streamer",
    isVip: true,
    tags: ["vip"],
    country: "BR",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const server = setupServer(
  http.get("http://localhost:3001/creators", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") ?? "";
    const items = search && !search.includes("Fulano") ? [] : [creatorFixture()];
    return HttpResponse.json({ items, total: items.length, page: 1, pageSize: 20 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderTable() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CreatorTable />
    </QueryClientProvider>,
  );
}

describe("CreatorTable", () => {
  it("renders creators returned by the API", async () => {
    renderTable();

    expect(await screen.findByText("Fulano da Silva")).toBeInTheDocument();
    expect(screen.getByText("@fulaninho")).toBeInTheDocument();
    expect(screen.getByText("1 creator")).toBeInTheDocument();
  });

  it("filters out rows when the search does not match and reflects it in the URL", async () => {
    const user = userEvent.setup();
    renderTable();

    await screen.findByText("Fulano da Silva");

    await user.type(screen.getByPlaceholderText(/Buscar por nome/), "zzz");

    await waitFor(() => expect(screen.getByText("Nenhum creator encontrado.")).toBeInTheDocument());
    await waitFor(() => expect(replace).toHaveBeenLastCalledWith("/creators?search=zzz", { scroll: false }));
  });
});
