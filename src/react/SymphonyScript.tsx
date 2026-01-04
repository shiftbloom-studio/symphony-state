import React from "react";

export type SymphonyScriptProps = {
  state: Record<string, unknown>;
  globalKey?: string;
};

const escapeJson = (value: string) =>
  value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

export const SymphonyScript = ({
  state,
  globalKey = "__SYMPHONY_STATE__"
}: SymphonyScriptProps) => {
  const serialized = escapeJson(JSON.stringify(state));
  const script = `window[${JSON.stringify(globalKey)}]=${serialized};`;
  return (
    <script
      data-symphony
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
};
