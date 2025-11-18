import { MailAPI, type Mail } from "@/api/mail.api";
import React, { useMemo, useState, useEffect } from "react";
import DOMPurify from "dompurify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RefreshCwIcon } from "@/components/ui/icons/lucide-refresh-cw";
dayjs.extend(relativeTime);
import duration from "dayjs/plugin/duration";
import { Trash2, Mail as MailIcon } from "lucide-react";
import { BlocksShuffle3Icon } from "@/components/ui/icons/svg-spinners-blocks-shuffle-3";
dayjs.extend(duration);

type InboxProps = {
  messages: Mail[];
  selected: Mail | null;
  onUpdateMessage: (id: string) => void;
  setSelected: (message: Mail) => void;
  deleteEmail: (id: string) => void;
  loadingDeleteEmail: boolean;
};

const Inbox: React.FC<InboxProps> = React.memo(
  ({
    messages,
    onUpdateMessage,
    setSelected,
    selected,
    deleteEmail,
    loadingDeleteEmail,
  }) => {
    const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

    useEffect(() => {
      if (!selected?.expires_at) {
        setMinutesLeft(null);
        return;
      }

      const compute = () =>
        Math.max(0, dayjs(selected.expires_at).diff(dayjs(), "minute"));

      // initial compute immediately
      setMinutesLeft(compute());

      // update every minute
      const iv = setInterval(() => {
        setMinutesLeft(compute());
      }, 60_000);

      // cleanup on selected change / unmount
      return () => clearInterval(iv);
    }, [selected?.expires_at]);

    // helper to produce text
    const minutesLeftText = (min: number | null) => {
      if (min === null) return "";
      if (min <= 0)
        return "This email will be automatically deleted in less than a minute.";
      return `This email will be automatically deleted in ${min} minute${
        min === 1 ? "" : "s"
      }.`;
    };

    const ReadEmail = async (id: string) => {
      try {
        const res = await MailAPI.readEmail(id);
        if (res.success) {
          onUpdateMessage(id);
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      }
    };

    const selectEmail = async (message: Mail) => {
      setSelected(message);
      await ReadEmail(message?._id);
    };

    const html = useMemo(() => {
      const htmlContent = selected?.html || "";
      return DOMPurify.sanitize(htmlContent);
    }, [selected?.html || ""]);

    return (
      <main className="w-full md:w-6xl mx-auto px-4 mt-10 flex-1">
        <div className="flex justify-between items-center mb-2 flex-none">
          <h2 className="text-2xl font-semibold">Inbox</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
          <aside
            className={`md:col-span-1 bg-white border rounded-md overflow-y-auto max-h-250`}
          >
            <div className="divide-y">
              {messages?.map((m) => (
                <a
                  href="#content-email"
                  key={m._id}
                  onClick={() => selectEmail(m)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-start gap-3 ${
                    selected?._id === m._id ? "bg-gray-200" : ""
                  }`}
                >
                  <div>
                    <div
                      className={
                        !m?.read || selected?._id == m._id
                          ? "text-sm font-medium"
                          : "text-sm"
                      }
                    >
                      <span>{m.subject}</span>
                    </div>

                    <div className="text-xs text-gray-400 text-right">
                      {dayjs(m?.received_at).fromNow()}
                    </div>
                  </div>
                </a>
              ))}
              {messages?.length === 0 && (
                <div className="p-4 text-gray-500">No messages</div>
              )}
            </div>
          </aside>

          {/* right: message content (col-span 3 on md) */}
          <section
            className="md:col-span-3 bg-white border rounded-md flex flex-col overflow-auto max-h-250"
            id="content-email"
          >
            {selected ? (
              <div className="p-4">
                <div className="flex items-center justify-between flex-wrap">
                  <div className="flex-1">
                    <h1 className="text-xl font-semibold">
                      {selected?.subject}
                    </h1>
                    <p className="text-sm text-yellow-600 bg-yellow-50 py-1 rounded w-max px-2 mt-2 md:mt-0">
                      {minutesLeftText(minutesLeft)}
                    </p>
                  </div>
                  <div className="flex-none">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md ease-in-out md:mx-auto mt-4 md:mt-0"
                      onClick={() => deleteEmail(selected?._id)}
                    >
                      {loadingDeleteEmail ? (
                        <BlocksShuffle3Icon size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete
                    </button>
                    <p className="text-sm mt-2 text-gray-400 text-right">
                      {dayjs(selected?.received_at).format(
                        "DD/MM/YYYY HH:mm:ss"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="px-4 text-gray-500">Message Content</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-100">
                <div className="relative">
                  <RefreshCwIcon
                    strokeWidth={1}
                    size={160}
                    style={{ animation: "spin 5s linear infinite" }}
                    className="animate-spin"
                  />
                  <MailIcon
                    className="absolute top-10 left-10"
                    size={80}
                    color={"#e1e8fe"}
                  />
                </div>

                <div className="p-4 text-gray-500">
                  Refreshing every 5 seconds…
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }
);

export default Inbox;
