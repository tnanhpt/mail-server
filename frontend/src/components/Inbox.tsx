import { useMailbox } from "@/hooks/useMailbox";
import React, { useState } from "react";

type MailItem = {
  id: string;
  from: string;
  subject: string;
  snippet?: string;
  receivedAt?: string;
};

const MOCK: MailItem[] = [
  {
    id: "1",
    from: "noreply@service.com",
    subject: "Welcome!",
    snippet: "Thanks for signing up...",
    receivedAt: "2025-11-16T10:00:00Z",
  },
  {
    id: "2",
    from: "alerts@company.com",
    subject: "Your invoice",
    snippet: "Your invoice #1234 is ready...",
    receivedAt: "2025-11-15T08:20:00Z",
  },
];

const Inbox: React.FC<{ email: string }> = ({ email }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const { messages, loading, error } = useMailbox(email);

  if (!email) return <div>No email selected</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading messages</div>;

  return (
    <main className="max-w-6xl mx-auto px-4 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Inbox</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded border text-sm hidden sm:inline"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? "Expand list" : "Collapse list"}
          </button>
        </div>
      </div>

      {/* responsive grid: single column on sm, 2 columns (list + content) on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* left: list - occupies full width on small screens; on md takes 1/3 (col-span 1 of 4) */}
        <aside
          className={`md:col-span-1 bg-white border rounded-md overflow-hidden ${
            collapsed ? "hidden md:block" : ""
          }`}
        >
          <div className="divide-y">
            {MOCK.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-start gap-3 ${
                  selected === m.id ? "bg-purple-50" : ""
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{m.subject}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {m.snippet}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(m.receivedAt || "").toLocaleDateString()}
                </div>
              </button>
            ))}
            {MOCK.length === 0 && (
              <div className="p-4 text-gray-500">No messages</div>
            )}
          </div>
        </aside>

        {/* right: message content (col-span 3 on md) */}
        <section className="md:col-span-3 bg-white border rounded-md min-h-[220px] flex flex-col">
          {selected ? (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Subject for id {selected}
                </h3>
                <div className="text-sm text-gray-400">10:00 AM</div>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <p>
                  This is a preview of the selected message. On small screens
                  the list collapses and you see content here.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Select a message to read or wait for incoming emails.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Inbox;
