import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Ahmed & Ashraqat | Wedding Invitation",description:"Join us to celebrate the wedding of Ahmed Qandeel and Ashraqat El Badwehy. Friday, 9 October 2026, 8 PM at Tiba Rose Hotel.",robots:{index:false,follow:false},icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
