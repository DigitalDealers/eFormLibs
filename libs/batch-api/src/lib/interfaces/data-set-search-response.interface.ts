export interface DataSetSearchResponse {
  hasMoreData: boolean;
  headerColumns: string[];
  headerGridColumns: string[];
  headerRows: {
    items: { [columnName: string]: any; }[];
    values: { [columnName: string]: any; };
  }[];
  lineItemColumns: string[];
}
