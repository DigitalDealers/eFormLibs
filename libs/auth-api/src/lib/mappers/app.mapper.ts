export class AppMapper {
  public static prepareData(data: any) {
    return data;
  }

  public static prepareDataList(res: any) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(AppMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
