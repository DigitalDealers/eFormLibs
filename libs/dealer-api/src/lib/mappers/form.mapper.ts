export class FormMapper {
  public static prepareData(data: any) {
    const { formType } = data;
    if (formType) {
      let shortName = '';
      const name = formType.split(' ').slice(0, 2);
      for (const item of name) {
        shortName += item.charAt(0).toUpperCase();
      }
      data.shortName = shortName;
    }
    return data;
  }

  public static prepareDataList(res: any) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(FormMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
