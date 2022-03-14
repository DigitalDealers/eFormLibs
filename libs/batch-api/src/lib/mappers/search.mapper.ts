import { DataSetSearchResponse, HeaderRow } from '../interfaces/data-set-search-response.interface';

export class SearchMapper {
  public static prepareDataList<T = any>(res: any): DataSetSearchResponse<T> {
    const {
      hasMoreData,
      headerColumns,
      headerGridColumns,
      headerRows,
      lineItemColumns
    } = res;

    return {
      hasMoreData: hasMoreData,
      headerColumns: SearchMapper.prepareHeaderColumns(headerColumns),
      headerGridColumns: SearchMapper.prepareHeaderGridColumns(headerGridColumns),
      headerRows: SearchMapper.prepareHeaderRows<T>(headerRows),
      lineItemColumns: SearchMapper.prepareLineItemColumns(lineItemColumns)
    };
  }

  private static prepareHeaderColumns(data: any) {
    const columns = [];
    if (data) {
      for (const item of data) {
        columns.push(item.columnName);
      }
    }
    return columns;
  }

  private static prepareHeaderGridColumns(data: any) {
    const columns = [];
    if (data) {
      for (const item of data) {
        columns.push(item.columnName);
      }
    }
    return columns;
  }

  private static prepareHeaderRows<T = unknown>(data: any): HeaderRow<T>[] {
    const rows: HeaderRow<T>[] = [];

    if (data) {
      for (const item of data) {
        const { items, values } = item;
        const elValue = {} as T;
        const elItem: { [columnName: string]: unknown; }[] = [];
        for (const v of values) {
          elValue[v.columnName as keyof T] = v.columnValue;
        }

        for (const it of items) {
          const row: { [columnName: string]: unknown; } = {};
          for (const i of it.values) {
            row[i.columnName] = i.columnValue;
          }
          elItem.push(row);
        }

        rows.push({ items: elItem, values: elValue });
      }
    }
    return rows;
  }

  private static prepareLineItemColumns(data: any) {
    const columns = [];
    if (data) {
      for (const item of data) {
        columns.push(item.columnName);
      }
    }
    return columns;
  }
}
