import { CertificatesApp } from "./components/CertificatesApp";
import { listCertificates } from "../lib/certificates";
import { randomInitialView } from "../lib/initialView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const certificates = await listCertificates();
  const initialView = randomInitialView();

  return (
    <main className="min-h-full flex flex-col">
      <CertificatesApp certificates={certificates} initialView={initialView} />
    </main>
  );
}
