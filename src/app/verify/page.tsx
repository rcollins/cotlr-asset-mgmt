import { Suspense } from "react";
import { AuthFormSkeleton } from "@/components/auth-form-skeleton";
import { ClientOnly } from "@/components/client-only";
import { VerifyForm } from "@/components/verify-form";

export default function VerifyPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter the code from your email
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <ClientOnly fallback={<AuthFormSkeleton />}>
            <Suspense fallback={<AuthFormSkeleton />}>
              <VerifyForm />
            </Suspense>
          </ClientOnly>
        </div>
      </div>
    </div>
  );
}
