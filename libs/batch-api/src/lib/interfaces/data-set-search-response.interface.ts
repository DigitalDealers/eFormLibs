export interface DataSetSearchResponse<T = unknown> {
  hasMoreData: boolean;
  headerColumns: string[];
  headerGridColumns: string[];
  headerRows: HeaderRow<T>[];
  lineItemColumns: any[];
}

export interface HeaderRow<T = unknown> {
  items: { [columnName: string]: unknown; }[];
  values: T;
}
