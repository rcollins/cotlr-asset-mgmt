import { AuthFormSkeleton } from "@/components/auth-form-skeleton";
import { ClientOnly } from "@/components/client-only";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Asset Management System
          </h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <ClientOnly fallback={<AuthFormSkeleton />}>
            <LoginForm />
          </ClientOnly>
        </div>
      </div>
    </div>
  );
}
