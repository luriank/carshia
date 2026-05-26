export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type CatalogSearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  sort?: string;
  page?: string;
};

export type CatalogFilters = {
  q: string;
  categories: string[];
  brands: string[];
  sort: SortValue;
  page: number;
};

function splitParam(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => decodeURIComponent(v.trim()))
    .filter(Boolean);
}

export function parseCatalogParams(
  params: CatalogSearchParams,
): CatalogFilters {
  const sort = (
    SORT_OPTIONS.some((o) => o.value === params.sort) ? params.sort : "newest"
  ) as SortValue;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  return {
    q: params.q?.trim() ?? "",
    categories: splitParam(params.category),
    brands: splitParam(params.brand),
    sort,
    page,
  };
}
