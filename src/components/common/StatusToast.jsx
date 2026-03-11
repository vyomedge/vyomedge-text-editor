// components/common/StatusToast.jsx
"use client";

import { useEffect, useState } from "react";

export default function StatusToast({ message }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div id="status" className={show ? "show" : ""}>
      {message}
    </div>
  );
}
