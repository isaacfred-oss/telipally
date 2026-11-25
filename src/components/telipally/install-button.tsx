"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePwa } from "@/lib/store";

export function InstallButton({ className }: { className?: string }) {
  const promptEvent = usePwa((s) => s.promptEvent);
  const installed = usePwa((s) => s.installed);

  if (!promptEvent || installed) return null;

  const handleInstall = async () => {
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        usePwa.getState().setInstalled(true);
        toast.success("TeliPally installed", {
          description: "Find it on your home screen or app launcher.",
        });
      }
      usePwa.getState().setPromptEvent(null);
    } catch {
      // user dismissed or browser error — ignore
    }
  };

  return (
    <Button size="sm" onClick={handleInstall} className={className} aria-label="Install TeliPally app">
      <Download aria-hidden="true" />
      Install app
    </Button>
  );
}
