import { MailAPI, type Mail } from "@/api/mail.api";
import React, { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RefreshCwIcon } from "@/components/ui/icons/lucide-refresh-cw";
dayjs.extend(relativeTime);

type InboxProps = {
  messages: Mail[];
  onUpdateMessage: (id: string) => void;
};

const Inbox: React.FC<InboxProps> = React.memo(
  ({ messages, onUpdateMessage }) => {
    const [selected, setSelected] = useState<Mail | null>(null);

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
                  key={m.message_id}
                  onClick={() => selectEmail(m)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-start gap-3 ${
                    selected?.message_id === m.message_id ? "bg-gray-200" : ""
                  }`}
                >
                  <div>
                    <div className={m.read ? "text-sm" : "text-sm font-medium"}>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selected?.subject}</h3>
                  <div className="text-xs text-gray-400 text-right">
                    {dayjs(selected?.received_at).format("DD/MM/YYYY HH:mm:ss")}
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-100">
                <RefreshCwIcon
                  strokeWidth={1}
                  color={"#c085ec"}
                  size={120}
                  style={{ animation: "spin 3s linear infinite" }}
                />
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
