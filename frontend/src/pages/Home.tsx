import React, { useState } from "react";
import Header from "../components/Header";
import EmailForm from "../components/EmailForm";
import Inbox from "../components/Inbox";

const Home: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <>
      <Header />
      <EmailForm onCreate={setEmail} />
      {email && <Inbox email={email} />}
    </>
  );
};

export default Home;
