import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Wifi, Bell, Share, Plus, MoreVertical, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const features = [
    {
      icon: Smartphone,
      title: "Works Offline",
      description: "Access your marketplace even without internet connection",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Get notified about new messages and orders instantly",
    },
    {
      icon: Wifi,
      title: "Fast Loading",
      description: "App loads instantly, just like a native app",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Install HustleSphere</h1>
            <p className="text-muted-foreground">
              Add HustleSphere to your home screen for the best experience
            </p>
          </div>

          {isInstalled ? (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="pt-6 text-center">
                <Check className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Already Installed!</h3>
                <p className="text-muted-foreground">
                  HustleSphere is installed on your device. Open it from your home screen.
                </p>
              </CardContent>
            </Card>
          ) : deferredPrompt ? (
            <Card className="mb-8">
              <CardContent className="pt-6 text-center">
                <Button onClick={handleInstall} size="lg" className="gap-2">
                  <Download className="w-5 h-5" />
                  Install Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>How to Install</CardTitle>
                <CardDescription>
                  Follow these steps based on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isIOS && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Smartphone className="w-5 h-5" /> iPhone / iPad
                    </h4>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          1
                        </span>
                        <span>
                          Tap the <Share className="w-4 h-4 inline mx-1" /> Share button in Safari
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          2
                        </span>
                        <span>
                          Scroll down and tap{" "}
                          <strong className="inline-flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add to Home Screen
                          </strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          3
                        </span>
                        <span>Tap "Add" in the top right corner</span>
                      </li>
                    </ol>
                  </div>
                )}

                {isAndroid && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Smartphone className="w-5 h-5" /> Android
                    </h4>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          1
                        </span>
                        <span>
                          Tap the <MoreVertical className="w-4 h-4 inline mx-1" /> menu button in Chrome
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          2
                        </span>
                        <span>
                          Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          3
                        </span>
                        <span>Tap "Install" to confirm</span>
                      </li>
                    </ol>
                  </div>
                )}

                {!isIOS && !isAndroid && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Desktop Browser</h4>
                    <p className="text-sm text-muted-foreground">
                      Look for the install icon in your browser's address bar, or use your browser's
                      menu to find "Install" or "Add to Home Screen" option.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
