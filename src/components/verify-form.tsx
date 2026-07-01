"use client";

import { useState } from "react";
import { OTP_LENGTH, OTP_PLACEHOLDER } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const router = useRouter();

  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    if (!email) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    setLoading(false);

    if (resendError) {
      setError(resendError.message);
    }
  }

  if (!email) {
    return (
      <p className="text-sm text-gray-500">
        No email provided. Please{" "}
        <a href="/login" className="font-medium text-gray-900 underline">
          start over
        </a>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-600">
        Enter the {OTP_LENGTH}-digit code sent to <strong>{email}</strong>
      </p>

      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700">
          Verification code
        </label>
        <input
          id="token"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          maxLength={OTP_LENGTH}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
          placeholder={OTP_PLACEHOLDER}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-widest shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || token.length < OTP_LENGTH}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify & Sign In"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="w-full text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        Resend code
      </button>
    </form>
  );
}
