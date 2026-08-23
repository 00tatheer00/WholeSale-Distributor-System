"use client";

import * as React from "react";
import { Download, Smartphone, Check, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showIOSModal, setShowIOSModal] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("PWA Service Worker active."))
        .catch((err) => console.log("SW registration skipped:", err));
    }

    // 2. Check if already running in standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capture beforeinstallprompt for Android & Desktop Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowIOSModal(true);
    }
  };

  // If already installed in standalone mode, hide the button
  if (isInstalled) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstallClick}
        className="h-9 px-2.5 sm:px-3 gap-1.5 rounded-full border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-semibold shadow-sm"
        title="Install PharmaDist ERP on Phone as App"
      >
        <Smartphone className="h-4 w-4 stroke-[2.2]" />
        <span className="hidden sm:inline font-semibold">Install Mobile App</span>
        <span className="sm:hidden font-semibold">App</span>
      </Button>

      {/* iOS & Manual Installation Instruction Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="max-w-md rounded-[24px] p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#0071E3]" />
              Phone Me App Install Karne Ka Tariqa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Is software ko baghair Play Store ke apne phone par real app ki tarah chalaein:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Share className="h-4 w-4 text-[#0071E3]" /> iPhone / iPad (Safari):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Neeche Safari browser me <strong>Share Button</strong> dabayein.</li>
                <li>Scroll karke <strong>&ldquo;Add to Home Screen&rdquo;</strong> par click karein.</li>
                <li>Top right par <strong>&ldquo;Add&rdquo;</strong> dabayein. App home screen par ajayegi.</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Download className="h-4 w-4 text-emerald-600" /> Android (Chrome / Edge):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Top right par 3 dots <strong>(&#8942;)</strong> menu kholein.</li>
                <li><strong>&ldquo;Install App&rdquo;</strong> ya <strong>&ldquo;Add to Home screen&rdquo;</strong> dabayein.</li>
                <li>Confirm karein, app aapke phone ke app drawer me save ho jayegi.</li>
              </ol>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setShowIOSModal(false)}
              className="rounded-xl px-5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold h-9"
            >
              Theek Hai
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
