"use client";

import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-full py-20">
      <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
    </div>
  );
}
