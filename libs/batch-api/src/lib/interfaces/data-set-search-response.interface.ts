export interface DataSetSearchResponse<T = any> {
  hasMoreData: boolean;
  headerColumns: string[];
  headerGridColumns: string[];
  headerRows: HeaderRow<T>[];
  lineItemColumns: any[];
}

export interface HeaderRow<T = any> {
  items: { [columnName: string]: any; }[];
  values: T;
}
