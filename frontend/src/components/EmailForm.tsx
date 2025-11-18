import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BlocksShuffle3Icon } from "@/components/ui/icons/svg-spinners-blocks-shuffle-3";
import CopyButton from "@/components/CopyBtn";

const DOMAINS = ["getfmail.com", "okmail.live", "jetmail.live"];

const KEY_LOCAL_USERNAME = "templ-apt-username";
const KEY_LOCAL_DOMAIN = "templ-apt-domain";

const EmailForm: React.FC<{
  onGetEmail: (username: string, domain: string) => void;
  loading: boolean;
}> = ({ onGetEmail, loading }) => {
  const [username, setUsername] = useState<string>("");
  const [domain, setDomain] = useState<string>(DOMAINS[0]);
  useEffect(() => {
    const load = () => {
      const usernameSaved = localStorage.getItem(KEY_LOCAL_USERNAME);
      const domainSaved = localStorage.getItem(KEY_LOCAL_DOMAIN);
      if (usernameSaved) {
        setUsername(usernameSaved || "");
      }
      if (domainSaved) {
        setDomain(domainSaved);
      }
      if (domainSaved && usernameSaved) {
        onGetEmail(usernameSaved, domainSaved);
      }
    };
    load();
    return () => {};
  }, [setUsername]);

  const handleCreate = () => {
    const unameTrim = username?.trim();
    const domainTrim = domain?.trim();
    localStorage.setItem(KEY_LOCAL_USERNAME, unameTrim);
    localStorage.setItem(KEY_LOCAL_DOMAIN, domainTrim);
    onGetEmail(username, domain);
  };


  return (
    <section className="w-full mt-8 px-4 flex-none">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            FREE Temporary Email
          </h1>
          <p className="text-gray-500 mt-2">
            Free, Fast, Private — use immediately without logging in!
          </p>
        </div>

        {/* form */}
        <div className="mt-8">
          {/* On small screens: stack; on md+: row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-[1fr_200px_300px] gap-3 items-end">
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
            <div className="sm:col-span-2 md:col-auto flex items-center gap-2">
              <motion.button
                onClick={handleCreate}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full md:w-auto px-5 py-3 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 flex gap-2  items-center"
              >
                <BlocksShuffle3Icon className={loading ? "block" : "hidden"} />{" "}
                <span>Get Email</span>
              </motion.button>
              <CopyButton text={`${username}@${domain}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailForm;
