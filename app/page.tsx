import { CertificatesApp } from "./components/CertificatesApp";
import { listCertificates } from "../lib/certificates";
import { defaultInitialView } from "../lib/initialView";

export default async function Home() {
  const certificates = await listCertificates();
  const initialView = defaultInitialView();

  return (
    <main className="min-h-full flex flex-col">
      <CertificatesApp certificates={certificates} initialView={initialView} />
    </main>
  );
}
