import 'dotenv/config';

export default {
  expo: {
    name: "PUSKA",
    slug: "UnsiKantin",
    scheme: "puska",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    icon: "./assets/icon.png",
    android: {
      package: "com.anonymous.puska"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "aa15121b-0722-434f-90c7-04478c450b84"
      }
    },
    runtimeVersion: "1.0.0",
    updates: {
      enabled: true,
      url: "https://u.expo.dev/aa15121b-0722-434f-90c7-04478c450b84", 
      channelName: "default",
      platform: ["android"] 
    }
  }
};

