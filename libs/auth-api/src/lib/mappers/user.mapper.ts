import { UserProfileUser } from '../interfaces/user-profile.interface';

export class UserMapper {
  public static prepareData(data: UserProfileUser): UserProfileUser {
    const { fName, lName, email } = data;
    const name = [fName, lName].filter(Boolean).join(' ');
    data.userFName = name;
    data.extraName = `${name} (${email})`;
    return data;
  }

  public static prepareDataList(res: any) {
    const result = [];
    const { total, data } = res;

    for (const item of data) {
      result.push(UserMapper.prepareData(item));
    }
    return { total, data: result };
  }
}
