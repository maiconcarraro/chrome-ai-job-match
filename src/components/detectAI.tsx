import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function DetectAI() {
  const [hasAI, setAI] = useState<boolean | undefined>();

  useEffect(() => {
    setAI(!window.ai || !window.ai.assistant);
  });

  return (
    <Dialog open={hasAI}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enabling AI in Chrome</DialogTitle>
        </DialogHeader>
        <div className="prose lg:prose-xl">
          <p>
            Chrome built-in AI is a preview feature, you need to use chrome
            version 127 or greater
          </p>
          <ul>
            <li>chrome://flags/#prompt-api-for-gemini-nano: Enabled</li>
            <li>
              chrome://flags/#optimization-guide-on-device-model: Enabled
              BypassPrefRequirement
            </li>
            <li>
              chrome://components/: Click Optimization Guide On Device Model to
              download the model.
            </li>
          </ul>
          <p>
            More info on:{" "}
            <a href="https://github.com/lightning-joyce/chromeai/issues/6#issuecomment-2322657491">
              https://github.com/lightning-joyce/chromeai/issues/6#issuecomment-2322657491
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
