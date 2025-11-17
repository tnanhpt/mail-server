import API from "@/helpers/axios";

export type Mail = {
  _id: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  read: boolean;
  received_at: string;
  expires_at: string;
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

async function readEmail(id: string): Promise<{ success: boolean }> {
  const res = await API.post(`/mails/read/${id}`);
  return res.data;
}

export const MailAPI = {
  getEmail,
  getEmailContent,
  readEmail,
};
