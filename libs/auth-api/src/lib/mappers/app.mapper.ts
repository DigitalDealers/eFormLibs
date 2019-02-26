export class AppMapper {
  public static prepareData(data) {
    return data;
  }

  public static prepareDataList(res) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(AppMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
