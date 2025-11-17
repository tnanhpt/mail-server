import { MailAPI, type MailboxResult } from "@/api/mail.api";
import { useEffect, useState, useRef } from "react";

export function useMailbox(email: string, pollInterval = 5000) {
  const [messages, setMessages] = useState<MailboxResult>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!email) return;

    let timer: number | null = null;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const msgs = await MailAPI.getEmail(email);
        if (mounted.current) setMessages(msgs);
      } catch (err: any) {
        if (mounted.current) setError(err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    load();
    timer = window.setInterval(load, pollInterval);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [email, pollInterval]);

  return { messages, loading, error };
}
