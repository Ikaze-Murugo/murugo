// app/layout.js
import { Inter } from "next/font/google";
import "./globals.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "@/context/AuthContext";
// import AdminNavigation from "@/components/common/AdminNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Real Estate Platform",
  description: "Find your perfect home with our comprehensive real estate platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/css/animate.css" />
        <link rel="stylesheet" href="/css/app.css" />
        <link rel="stylesheet" href="/css/theme.css" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
        <link rel="stylesheet" href="/fonts/font-icons.css" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {/* <AdminNavigation /> */}
          {children}
        </AuthProvider>
        
        {/* Bootstrap JS */}
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
          async
        ></script>
      </body>
    </html>
  );
}