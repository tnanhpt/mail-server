import API from "@/helpers/axios";

export type Mail = {
  message_id: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  read: boolean;
};

export type MailboxResult = {
  count: number;
  emails: Mail[];
};

async function getEmail(email: string): Promise<MailboxResult> {
  const res = await API.get(`/mails/by-email/${email}`);
  return res.data;
}

async function getEmailContent(id: string): Promise<Mail[]> {
  const res = await API.get(`/mails/${id}`);
  return res.data as Mail[];
}

export const MailAPI = {
  getEmail,
  getEmailContent,
};
