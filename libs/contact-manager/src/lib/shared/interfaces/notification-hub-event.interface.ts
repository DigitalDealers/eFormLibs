export interface NotificationHubEvent {
  application: string;
  toEmail: string;
  subject: string;
  data: { [key: string]: string };
}
