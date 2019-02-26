export class UserMapper {
  public static prepareData(data) {
    let name = '';
    const { fName, lName, email } = data;

    if (fName) {
      name = `${fName} `;
    }

    if (lName) {
      name += `${lName}`;
    }

    data['userFName'] = name;
    name += ` (${email})`;
    data['extraName'] = name;

    return data;
  }

  public static prepareDataList(res) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(UserMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
