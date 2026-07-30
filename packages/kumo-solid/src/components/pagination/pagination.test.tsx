import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import {
  Pagination,
  KUMO_PAGINATION_DEFAULT_VARIANTS,
  paginationVariants,
} from "./pagination";

function renderPagination(
  options: {
    page?: number;
    perPage?: number;
    totalCount?: number;
    setPage?: (page: number) => void;
    controls?: "full" | "simple";
    pageSelector?: "input" | "dropdown";
  } = {},
) {
  const setPage = options.setPage ?? vi.fn();
  const result = render(() => (
    <Pagination
      page={options.page ?? 1}
      setPage={setPage}
      perPage={options.perPage ?? 10}
      totalCount={options.totalCount ?? 100}
    >
      <Pagination.Info />
      <Pagination.Controls
        controls={options.controls}
        pageSelector={options.pageSelector}
      />
    </Pagination>
  ));
  return { ...result, setPage };
}

describe("Pagination", () => {
  it("preserves the Kumo variant contract", () => {
    expect(KUMO_PAGINATION_DEFAULT_VARIANTS.controls).toBe("full");
    expect(paginationVariants()).toContain("justify-between");
  });

  it("renders the legacy layout with range information", () => {
    render(() => (
      <Pagination
        page={2}
        setPage={() => undefined}
        perPage={10}
        totalCount={100}
      />
    ));

    expect(screen.getByText("11-20")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  it("renders full navigation controls and correct edge states", () => {
    renderPagination({ page: 1 });

    expect(
      (
        screen.getByRole("button", {
          name: "First page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Previous page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Next page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(
      (
        screen.getByRole("button", {
          name: "Last page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(screen.getByRole("textbox", { name: "Page number" })).toBeTruthy();
  });

  it("navigates with first, previous, next, and last buttons", () => {
    const setPage = vi.fn();
    renderPagination({ page: 5, setPage });

    fireEvent.click(screen.getByRole("button", { name: "First page" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));

    expect(setPage.mock.calls.map(([page]) => page)).toEqual([1, 4, 6, 10]);
  });

  it("uses an individual div InputGroup for the controls", () => {
    const { container } = renderPagination({ page: 5 });
    const group = container.querySelector('[data-slot="input-group"]');

    expect(group?.tagName).toBe("DIV");
    expect(group?.getAttribute("data-focus-mode")).toBe("individual");
  });

  it("commits and clamps a typed page on Enter and blur", () => {
    const setPage = vi.fn();
    renderPagination({ page: 1, setPage });
    const input = screen.getByRole("textbox", { name: "Page number" });

    fireEvent.input(input, { target: { value: "999" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(setPage).toHaveBeenLastCalledWith(10);
    expect((input as HTMLInputElement).value).toBe("10");

    fireEvent.input(input, { target: { value: "0" } });
    fireEvent.blur(input);
    expect(setPage).toHaveBeenLastCalledWith(1);
    expect((input as HTMLInputElement).value).toBe("1");
  });

  it("renders only previous and next buttons in simple mode", () => {
    renderPagination({ controls: "simple" });

    expect(screen.queryByRole("button", { name: "First page" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Last page" })).toBeNull();
    expect(screen.queryByRole("textbox", { name: "Page number" })).toBeNull();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next page" })).toBeTruthy();
  });

  it("selects a page through the dropdown selector", async () => {
    const setPage = vi.fn();
    renderPagination({
      page: 1,
      setPage,
      pageSelector: "dropdown",
    });

    const trigger = screen.getByRole("combobox", { name: "Page number" });
    fireEvent.mouseDown(trigger);
    const option = await screen.findByRole("option", { name: "5" });
    fireEvent.mouseMove(option);
    fireEvent.click(option);

    expect(setPage).toHaveBeenCalledWith(5);
  });

  it("renders and updates the page-size selector", async () => {
    const onChange = vi.fn();
    render(() => (
      <Pagination
        page={1}
        setPage={() => undefined}
        perPage={25}
        totalCount={200}
      >
        <Pagination.Info />
        <Pagination.Separator data-testid="separator" />
        <Pagination.PageSize
          value={25}
          options={[10, 25, 50]}
          onChange={onChange}
        />
      </Pagination>
    ));

    expect(screen.getByText("Per page:")).toBeTruthy();
    expect(screen.getByTestId("separator").className).toContain(
      "border-kumo-hairline",
    );
    const trigger = screen.getByRole("combobox", { name: "Page size" });
    expect(trigger.textContent).toContain("25");
    fireEvent.mouseDown(trigger);
    const option = await screen.findByRole("option", { name: "50" });
    fireEvent.mouseMove(option);
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledWith(50);
  });

  it("supports custom info rendering and localized labels", () => {
    render(() => (
      <Pagination
        page={2}
        setPage={() => undefined}
        perPage={10}
        totalCount={50}
        labels={{
          navigation: "Pages",
          nextPage: "Page suivante",
        }}
      >
        <Pagination.Info>
          {({ page, pageShowingRange }) => `Page ${page}: ${pageShowingRange}`}
        </Pagination.Info>
        <Pagination.Controls controls="simple" />
      </Pagination>
    ));

    expect(screen.getByText("Page 2: 11-20")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Pages" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeTruthy();
  });

  it("keeps page, range, and editing state reactive", async () => {
    const [page, setPage] = createSignal(1);
    render(() => (
      <Pagination page={page()} setPage={setPage} perPage={10} totalCount={100}>
        <Pagination.Info />
        <Pagination.Controls />
      </Pagination>
    ));

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() => expect(screen.getByText("11-20")).toBeTruthy());
    expect(
      (
        screen.getByRole("textbox", {
          name: "Page number",
        }) as HTMLInputElement
      ).value,
    ).toBe("2");
  });

  it("uses custom legacy text and class aliases", () => {
    render(() => (
      <Pagination
        page={3}
        setPage={() => undefined}
        perPage={20}
        totalCount={100}
        class="custom-pagination"
        text={({ page, perPage }) => `Page ${page}, ${perPage} each`}
      />
    ));

    expect(screen.getByText("Page 3, 20 each")).toBeTruthy();
    expect(
      document.querySelector('[data-slot="pagination"]')?.className,
    ).toContain("custom-pagination");
  });
});
