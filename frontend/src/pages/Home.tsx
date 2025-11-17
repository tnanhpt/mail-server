import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import EmailForm from "../components/EmailForm";
import Inbox from "../components/Inbox";
import { MailAPI, type Mail } from "@/api/mail.api";
import { sleep } from "@/helpers/func";

const POLL_INTERVAL_MS = 5000;

const Home: React.FC = () => {
  const [loadingGetMail, setLoadingGetMail] = useState(false);
  const [listMessage, setListMessage] = useState<Mail[]>([]);
  const [selected, setSelected] = useState<Mail | null>(null);
  // interval ID ref (browser setInterval returns number)
  const intervalRef = useRef<number | null>(null);
  // guard để tránh gọi chồng request khi fetch chưa xong
  const isFetchingRef = useRef(false);

  const fetchEmail = async (email: string, isSetLoading: boolean = true) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      if (isSetLoading) setLoadingGetMail(true);
      await sleep(500);
      const data = await MailAPI.getEmail(email);
      setListMessage(data.emails);
    } catch (err: unknown) {
      setListMessage([]);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      if (isSetLoading) setLoadingGetMail(false);
      isFetchingRef.current = false;
    }
  };

  const onGetEmail = async (username: string, domain: string) => {
    const email = `${username}@${domain}`;

    if (intervalRef.current !== null || (!username && intervalRef.current)) {
      stopPolling();
    }
    if (!username) return;
    await fetchEmail(email);

    intervalRef.current = window.setInterval(() => {
      fetchEmail(email, false);
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Tùy chọn: hàm để dừng polling nếu cần
  const stopPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const onUpdateMessage = (id: string) => {
    setListMessage((old) =>
      old.map((item) => {
        if (item._id === id) {
          return {
            ...item,
            read: true,
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <EmailForm onGetEmail={onGetEmail} loading={loadingGetMail} />
      <Inbox
        onUpdateMessage={onUpdateMessage}
        messages={listMessage}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
};

export default Home;
