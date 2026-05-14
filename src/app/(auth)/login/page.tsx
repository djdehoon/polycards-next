import { safeInternalPath } from "@/lib/safe-redirect";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const validatedNext = safeInternalPath(sp.next);

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-zinc-900">Sign in</h2>
      <LoginForm urlErrorKey={sp.error} nextPath={validatedNext} />
    </div>
  );
}
