import { createSignal } from "solid-js";

import { Pagination } from "@photon-ai/kumo-solid";

export function PaginationBasicDemo() {
  const [page, setPage] = createSignal(1);

  return (
    <Pagination page={page()} setPage={setPage} perPage={10} totalCount={100} />
  );
}

export function PaginationSimpleDemo() {
  const [page, setPage] = createSignal(1);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={10}
      totalCount={100}
      controls="simple"
    />
  );
}

export function PaginationFullDemo() {
  const [page, setPage] = createSignal(1);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={10}
      totalCount={100}
      controls="full"
    />
  );
}

export function PaginationMidPageDemo() {
  const [page, setPage] = createSignal(5);

  return (
    <Pagination page={page()} setPage={setPage} perPage={10} totalCount={100} />
  );
}

export function PaginationLargeDatasetDemo() {
  const [page, setPage] = createSignal(1);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={25}
      totalCount={1250}
    />
  );
}

export function PaginationCustomTextDemo() {
  const [page, setPage] = createSignal(1);
  return (
    <Pagination
      text={({ perPage }: { perPage?: number }) =>
        `Page ${page()} - showing ${perPage} per page`
      }
      page={page()}
      setPage={setPage}
      perPage={25}
      totalCount={100}
    />
  );
}

/** Pagination with a page size selector using compound components. */
export function PaginationPageSizeSelectorDemo() {
  const [page, setPage] = createSignal(1);
  const [perPage, setPerPage] = createSignal(25);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={perPage()}
      totalCount={500}
    >
      <Pagination.Info />
      <Pagination.Separator />
      <Pagination.PageSize
        value={perPage()}
        onChange={(size) => {
          setPerPage(size);
          setPage(1);
        }}
      />
      <Pagination.Controls />
    </Pagination>
  );
}

/** Pagination with custom page size options using compound components. */
export function PaginationCustomPageSizeOptionsDemo() {
  const [page, setPage] = createSignal(1);
  const [perPage, setPerPage] = createSignal(10);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={perPage()}
      totalCount={200}
    >
      <Pagination.Info />
      <Pagination.Separator />
      <Pagination.PageSize
        value={perPage()}
        onChange={(size) => {
          setPerPage(size);
          setPage(1);
        }}
        options={[10, 20, 50]}
      />
      <Pagination.Controls />
    </Pagination>
  );
}

/** Pagination with custom info text using compound components. */
export function PaginationCompoundCustomInfoDemo() {
  const [page, setPage] = createSignal(1);

  return (
    <Pagination page={page()} setPage={setPage} perPage={25} totalCount={100}>
      <Pagination.Info>
        {({ page, totalCount }) =>
          `Page ${page} of ${Math.ceil((totalCount ?? 1) / 25)}`
        }
      </Pagination.Info>
      <Pagination.Controls />
    </Pagination>
  );
}

/** Pagination with a dropdown page selector instead of a text input. */
export function PaginationDropdownSelectorDemo() {
  const [page, setPage] = createSignal(1);
  const [perPage, setPerPage] = createSignal(25);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={perPage()}
      totalCount={500}
    >
      <Pagination.Info />
      <Pagination.Separator />
      <Pagination.PageSize
        value={perPage()}
        onChange={(size) => {
          setPerPage(size);
          setPage(1);
        }}
      />
      <Pagination.Controls pageSelector="dropdown" />
    </Pagination>
  );
}

/** Pagination with page size selector on the right side. */
export function PaginationPageSizeRightDemo() {
  const [page, setPage] = createSignal(1);
  const [perPage, setPerPage] = createSignal(25);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={perPage()}
      totalCount={500}
    >
      <Pagination.Info />
      <div class="flex items-center gap-2">
        <Pagination.Controls />
        <Pagination.Separator />
        <Pagination.PageSize
          value={perPage()}
          onChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
        />
      </div>
    </Pagination>
  );
}

/** Pagination with French labels for internationalization. */
export function PaginationI18nDemo() {
  const [page, setPage] = createSignal(1);

  return (
    <Pagination
      page={page()}
      setPage={setPage}
      perPage={10}
      totalCount={100}
      labels={{
        firstPage: "Première page",
        previousPage: "Page précédente",
        nextPage: "Page suivante",
        lastPage: "Dernière page",
        pageNumber: "Numéro de page",
        pageSize: "Taille de page",
      }}
    >
      <Pagination.Info>
        {({ pageShowingRange, totalCount }) => (
          <>
            Affichage de <span class="tabular-nums">{pageShowingRange}</span>{" "}
            sur <span class="tabular-nums">{totalCount}</span>
          </>
        )}
      </Pagination.Info>
      <Pagination.Controls />
    </Pagination>
  );
}
