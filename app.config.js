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
      supabaseUrl: "https://yhjwcriumhfmkwqbxziz.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inloandjcml1bWhmbWt3cWJ4eml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NDM4MjksImV4cCI6MjA1MDQxOTgyOX0.8ApfZnLK2VJofRkz1Qzjnu1-n-c108HPc8u1MbEoevk",
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
