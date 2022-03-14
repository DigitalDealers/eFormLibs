export class DataSetMapper {
  public static prepareData(data: any) {
    if (data.linkedDataSource) {
      data.dataSourceName = data.linkedDataSource.dataSourceName;
      data.isSqlType = data.dataSourceName !== 'VisionLink';
    }

    if (data.incrementalKeys) {
      data.incrementalKeys = data.incrementalKeys.split(',');
    } else {
      data.incrementalKeys = null;
    }

    return data;
  }

  public static prepareListData(res: any) {
    const { total, data } = res;
    for (const index in data) {
      if (data.hasOwnProperty(index)) {
        data[index] = DataSetMapper.prepareData(data[index]);
      }
    }
    return { total, data };
  }
}
