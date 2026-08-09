"use client";

import { useState, useEffect } from "react";
import { instalarStorage } from "../lib/storage-shim";
import App from "./RenderRoom";

export default function Pagina() {
  const [listo, setListo] = useState(false);
  useEffect(() => { instalarStorage(); setListo(true); }, []);
  if (!listo) return null;
  return <App />;
}
