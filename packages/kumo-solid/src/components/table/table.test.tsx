import { fireEvent, render, screen, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { Table } from "./table";

describe("Table", () => {
  it("renders the complete semantic structure and merges root attributes", () => {
    render(() => (
      <Table layout="fixed" class="solid-class" className="compat-class">
        <caption>Deployments</caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Worker</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>api</Table.Cell>
            <Table.Cell>Healthy</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={2}>1 deployment</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    ));

    const table = screen.getByRole("table", { name: "Deployments" });
    expect(table.tagName).toBe("TABLE");
    expect(table.classList.contains("table-fixed")).toBe(true);
    expect(table.classList.contains("solid-class")).toBe(true);
    expect(table.classList.contains("compat-class")).toBe(true);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Healthy").tagName).toBe("TD");
    expect(screen.getByText("1 deployment").closest("tfoot")).toBeTruthy();
  });

  it("applies compact, sticky, selected, and custom cell styling reactively", () => {
    const [selected, setSelected] = createSignal(false);
    const { container } = render(() => (
      <>
        <Table>
          <Table.Header variant="compact" sticky>
            <Table.Row>
              <Table.Head sticky="left">Name</Table.Head>
              <Table.Head sticky="right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row variant={selected() ? "selected" : "default"}>
              <Table.Cell sticky="left">api</Table.Cell>
              <Table.Cell sticky="right" className="actions">
                Open
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
        <button type="button" onClick={() => setSelected(true)}>
          Select
        </button>
      </>
    ));

    const header = container.querySelector("thead");
    const headers = screen.getAllByRole("columnheader");
    const cells = screen.getAllByRole("cell");
    const row = screen.getByText("api").closest("tr");

    expect(header?.hasAttribute("data-compact")).toBe(true);
    expect(header?.classList.contains("[&_th]:sticky")).toBe(true);
    expect(headers[0].classList.contains("left-0")).toBe(true);
    expect(headers[0].classList.contains("z-2")).toBe(true);
    expect(headers[1].classList.contains("right-0")).toBe(true);
    expect(cells[0].classList.contains("z-1")).toBe(true);
    expect(cells[1].classList.contains("actions")).toBe(true);
    expect(row?.classList.contains("bg-kumo-tint")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    expect(row?.classList.contains("bg-kumo-tint")).toBe(true);
  });

  it("forwards check-cell changes and keeps the legacy callback working", () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(() => (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.CheckHead
              checked={false}
              onCheckedChange={onCheckedChange}
              aria-label="Select every deployment"
            />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.CheckCell
              checked={false}
              onCheckedChange={onCheckedChange}
              onValueChange={onValueChange}
              aria-label="Select api"
            />
          </Table.Row>
        </Table.Body>
      </Table>
    ));

    const selectAll = screen.getByRole("checkbox", {
      name: "Select every deployment",
    });
    const selectRow = screen.getByRole("checkbox", { name: "Select api" });

    fireEvent.click(selectAll);
    fireEvent.click(selectRow);

    expect(onCheckedChange).toHaveBeenCalledTimes(2);
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
    expect(onCheckedChange.mock.calls[0][1]).toBeDefined();
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("supports disabled and indeterminate check cells", () => {
    const onCheckedChange = vi.fn();
    render(() => (
      <table>
        <tbody>
          <tr>
            <Table.CheckCell
              indeterminate
              disabled
              label="Select partial row"
              onCheckedChange={onCheckedChange}
            />
          </tr>
        </tbody>
      </table>
    ));

    const checkbox = screen.getByRole("checkbox", {
      name: "Select partial row",
    });
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
    fireEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("renders an accessible resize handle and forwards native events", () => {
    const onPointerDown = vi.fn();
    const { container } = render(() => (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>
              Name
              <Table.ResizeHandle
                className="custom-handle"
                data-column="name"
                onPointerDown={onPointerDown}
              />
            </Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>
    ));

    const handle = within(container).getByRole("button", {
      name: "Resize column",
    });
    expect(handle.getAttribute("type")).toBe("button");
    expect(handle.getAttribute("data-column")).toBe("name");
    expect(handle.classList.contains("custom-handle")).toBe(true);
    fireEvent.pointerDown(handle);
    expect(onPointerDown).toHaveBeenCalledOnce();
  });
});
