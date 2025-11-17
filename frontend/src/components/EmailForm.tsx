import React, { useState } from "react";
import { motion } from "framer-motion";

const DOMAINS = [
  "mail.anhpham.info",
  "fviadropinbox.com",
  "fviamail.work",
  "dropinboxes.com",
];

const EmailForm: React.FC<{ onCreate: (mail: string) => void }> = ({
  onCreate,
}) => {
  const [username, setUsername] = useState<string>("");
  const [domain, setDomain] = useState<string>(DOMAINS[0]);

  const handleCreate = () => {
    const email = `${username || "anon"}@${domain}`;
    console.log("create email:", email);
    onCreate(`${username || "anon"}@${domain}`);
    // gọi API...
  };

  return (
    <section className="w-full mt-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            FREE Temporary Email
          </h1>
          <p className="text-gray-500 mt-2">
            Free, Fast, Private — dùng ngay không cần đăng ký
          </p>
        </div>

        {/* form */}
        <div className="mt-8">
          {/* On small screens: stack; on md+: row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-[1fr_200px_200px] gap-3 items-end">
            <input
              className="w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="Enter username (e.g. coolguy)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* domain select - full width on mobile (spans row under input) */}
            <select
              className="w-full px-4 py-3 rounded-md border border-gray-300
                        transition-all duration-300 ease-[cubic-bezier(.22,.68,0,1)]
                        focus:outline-none
                        focus:ring-0
                        shadow-[0_0_0_0_rgba(139,92,246,0.4)]
                        focus:shadow-[0_0_0_4px_rgba(139,92,246,0.4)]
                        focus:scale-[1.01]
                        hover:scale-[1.005]"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div className="sm:col-span-2 md:col-auto">
              <motion.button
                onClick={handleCreate}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full md:w-auto px-5 py-3 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700"
              >
                Get Email
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailForm;
