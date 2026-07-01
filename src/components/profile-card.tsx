import { Card } from "@/components/card";
import { formatRole } from "@/lib/permissions";
import type { Profile } from "@/lib/types";

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Card title="Profile Information" subtitle="Your account details">
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Full Name</p>
          <p className="mt-1 text-sm text-gray-900">
            {profile.full_name ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Role</p>
          <p className="mt-1 text-sm text-gray-900">
            {formatRole(profile.role)}
          </p>
        </div>
      </div>
    </Card>
  );
}
