export class BotMapper {
  public static prepareData(data) {
    return data;
  }

  public static prepareDataList(res) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(BotMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
