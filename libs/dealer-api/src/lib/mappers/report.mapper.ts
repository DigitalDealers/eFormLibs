export class ReportMapper {
  public static prepareData(data) {
    const { reportName, isDashboard } = data;
    if (reportName) {
      let shortName = '';
      const name = reportName.split(' ').slice(0, 3);
      for (const item of name) {
        shortName += item.charAt(0).toUpperCase();
      }
      data['shortName'] = shortName;
    }
    data['dashboard'] = !!isDashboard ? 'Yes' : 'No';

    return data;
  }

  public static prepareDataList(res) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(ReportMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
