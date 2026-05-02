import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-zinc-900">Sign in</h2>
      <LoginForm urlErrorKey={sp.error} />
    </div>
  );
}
