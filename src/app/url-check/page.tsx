import { UrlChecker } from "@/components/url-checker";
import { Navbar } from "@/components/navbar";

export default function UrlCheckPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <UrlChecker />
      </div>
    </>
  );
}
