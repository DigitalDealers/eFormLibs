import { DatePipe } from '@angular/common';

export class InteractionMapper {
  public static formatDate(data) {
    const datePipe = new DatePipe('en-US');
    const { createdOn, modifiedOn } = data;
    data.createdOn = datePipe.transform(createdOn, 'dd/MM/yyyy');
    data.modifiedOn = datePipe.transform(modifiedOn, 'dd/MM/yyyy');
    return data;
  }

  public static prepareDataList(res) {
    const { total, data } = res;
    let submitted = 0;
    let inProgress = 0;
    let completed = 0;
    let canceled = 0;
    const result = data.map(item => {
      switch (item.status) {
        case 'Submitted':
          submitted++;
          break;
        case 'Completed':
          completed++;
          break;
        case 'Canceled':
          canceled++;
          break;
        case 'In progress':
          inProgress++;
          break;
      }
      return InteractionMapper.formatDate(item);
    });

    return { total, submitted, inProgress, completed, canceled, data: result };
  }
}
