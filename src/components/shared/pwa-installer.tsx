"use client";

import * as React from "react";
import { Download, Smartphone, Share, CheckCircle2, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.log("SW registration notice:", err);
        });
    }

    // 2. Check if already running in standalone mode (installed)
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

    // 4. Capture beforeinstallprompt for Android & Desktop Chrome / Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Track successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
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
        className="h-9 px-2.5 sm:px-3 gap-1.5 rounded-full border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-semibold shadow-sm"
        title="Install PharmaDist ERP on Phone as App"
      >
        <Smartphone className="h-4 w-4 stroke-[2.2] text-emerald-600 dark:text-emerald-300" />
        <span className="hidden sm:inline font-semibold">Install Mobile App</span>
        <span className="sm:hidden font-semibold">App</span>
      </Button>

      {/* Comprehensive Illustrated PWA Installation Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md w-[92vw] rounded-[24px] p-5 sm:p-6 bg-background border border-border shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-2 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                  PharmaDist ERP Phone App
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Baghair Play Store / App Store ke apne phone me install karein
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {/* If direct native prompt is available */}
            {deferredPrompt && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-xs">Direct Install Ready!</p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-200">Phone me 1-click install karein:</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-8 px-3.5 shadow-sm font-semibold"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Install Now
                </Button>
              </div>
            )}

            {/* Android (Chrome / Edge / Samsung) */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-emerald-600" /> Android (Chrome / Edge / Samsung)
                </span>
                <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  Android
                </Badge>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Browser me top right par <strong>3 Dots (⋮)</strong> menu dabayein.</li>
                <li><strong>&ldquo;Install app&rdquo;</strong> ya <strong>&ldquo;Add to Home screen&rdquo;</strong> par tap karein.</li>
                <li>Confirm karne par app phone ke Home Screen aur App Drawer me icon ban kar save ho jayegi.</li>
              </ol>
            </div>

            {/* iPhone / iPad (Safari) */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Share className="h-4 w-4 text-[#0071E3]" /> iPhone / iPad (Safari)
                </span>
                <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200">
                  iOS
                </Badge>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Safari browser ke bottom bar me <strong>Share Button (⎋ / مربع تیر)</strong> dabayein.</li>
                <li>Scroll karke <strong>&ldquo;Add to Home Screen (ہوم اسکرین پر شامل کریں)&rdquo;</strong> par tap karein.</li>
                <li>Top right par <strong>&ldquo;Add&rdquo;</strong> dabayein. App home screen par real app ki tarah open hogi!</li>
              </ol>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Full Screen • Offline Ready • Fast
            </span>
            <Button
              onClick={() => setShowModal(false)}
              className="rounded-xl px-5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold h-8.5"
            >
              Samajh Aa Gaya
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
