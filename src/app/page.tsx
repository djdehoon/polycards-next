import { LandingPage } from "@/components/landing/LandingPage";
import { APP_VERSION } from "@/lib/app-version";

export default function Home() {
  return <LandingPage appVersion={APP_VERSION} />;
}
