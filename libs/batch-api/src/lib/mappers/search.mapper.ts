import { DataSetSearchResponse } from '../interfaces/data-set-search-response.interface';

export class SearchMapper {
  public static prepareDataList<T = any>(res): DataSetSearchResponse<T> {
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
      headerRows: SearchMapper.prepareHeaderRows(headerRows),
      lineItemColumns: SearchMapper.prepareLineItemColumns(lineItemColumns)
    };
  }

  private static prepareHeaderColumns(data) {
    const columns = [];
    if (data) {
      for (const item of data) {
        columns.push(item.columnName);
      }
    }
    return columns;
  }

  private static prepareHeaderGridColumns(data) {
    const columns = [];
    if (data) {
      for (const item of data) {
        columns.push(item.columnName);
      }
    }
    return columns;
  }

  private static prepareHeaderRows(data) {
    const rows = [];

    if (data) {
      for (const item of data) {
        const { items, values } = item;
        const elValue = {};
        const elItem = [];
        for (const v of values) {
          elValue[v.columnName] = v.columnValue;
        }

        for (const it of items) {
          const row = {};
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

  private static prepareLineItemColumns(data) {
    const columns = [];
    if (data) {
      for (const item of data) {
        columns.push(item.columnName);
      }
    }
    return columns;
  }
}
