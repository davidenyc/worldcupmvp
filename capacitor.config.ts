import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gamedaymap.app",
  appName: "GameDay Map",
  server: {
    url: "https://worldcupmvp.vercel.app",
    cleartext: false
  },
  webDir: "out",
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: true,
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a1628",
      iosSpinnerStyle: "small",
      spinnerColor: "#f4b942",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a1628"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
