export class RoleMapper {
  public static prepareData(data: any) {
    const { isDefault } = data;

    data.type = isDefault ? 'Default Role' : 'Custom Role';

    return data;
  }

  public static prepareDataList(res: any) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(RoleMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
