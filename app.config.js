import 'dotenv/config';

export default {
  expo: {
    name: "PUSKA",
    slug: "UnsiKantin",
    scheme: "PUSKA",
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
    runtimeVersion: {
      policy: "appVersion" // <- Gunakan ini agar tidak error di cloud
    },
    updates: {
      enabled: true
    }
  }
};
