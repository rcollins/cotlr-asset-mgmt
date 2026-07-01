"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  createSite,
  createUser,
  deleteCategory,
  deleteLocation,
  deleteSite,
  deleteUser,
  updateCategory,
  updateLocation,
  updateSite,
  updateUser,
} from "@/app/admin-actions";
import { createLocation } from "@/app/actions";
import { Card } from "@/components/card";
import { formatRole } from "@/lib/permissions";
import { SITE_FILTER_PARAM } from "@/lib/site-filter";
import type {
  AssetCategory,
  Location,
  Profile,
  Site,
  UserRole,
} from "@/lib/types";

type AdminTab = "categories" | "sites" | "locations" | "users" | "export";

type AdminManagerProps = {
  categories: AssetCategory[];
  sites: Site[];
  locations: Location[];
  users: Profile[];
  siteFilterId: string | null;
  siteFilterName: string | null;
};

const USER_ROLES: UserRole[] = ["admin", "cfo", "manager", "viewer"];

const TAB_LABELS: Record<AdminTab, string> = {
  categories: "Categories",
  sites: "Sites",
  locations: "Locations",
  users: "Users",
  export: "Export",
};

export function AdminManager({
  categories,
  sites,
  locations,
  users,
  siteFilterId,
  siteFilterName,
}: AdminManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("categories");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    setError(null);
    setLoading(true);
    const result = await action();
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return false;
    }

    router.refresh();
    return true;
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (siteFilterId) {
      params.set(SITE_FILTER_PARAM, siteFilterId);
    }
    const query = params.toString();
    window.location.href = query
      ? `/api/admin/assets/export?${query}`
      : "/api/admin/assets/export";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
        <p className="text-sm text-gray-500">
          Manage categories, sites, locations, users, and export assets.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {(Object.keys(TAB_LABELS) as AdminTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              activeTab === tab
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {activeTab === "categories" && (
        <CategoriesPanel
          categories={categories}
          loading={loading}
          onCreate={(data) => runAction(() => createCategory(data))}
          onUpdate={(id, data, previousName) =>
            runAction(() => updateCategory(id, data, previousName))
          }
          onDelete={(id, name) => runAction(() => deleteCategory(id, name))}
        />
      )}

      {activeTab === "sites" && (
        <SitesPanel
          sites={sites}
          loading={loading}
          onCreate={(data) => runAction(() => createSite(data))}
          onUpdate={(id, data) => runAction(() => updateSite(id, data))}
          onDelete={(id) => runAction(() => deleteSite(id))}
        />
      )}

      {activeTab === "locations" && (
        <LocationsPanel
          locations={locations}
          sites={sites}
          loading={loading}
          onCreate={(data) => runAction(() => createLocation(data))}
          onUpdate={(id, data) => runAction(() => updateLocation(id, data))}
          onDelete={(id) => runAction(() => deleteLocation(id))}
        />
      )}

      {activeTab === "users" && (
        <UsersPanel
          users={users}
          loading={loading}
          onCreate={(data) => runAction(() => createUser(data))}
          onUpdate={(id, data) => runAction(() => updateUser(id, data))}
          onDelete={(id) => runAction(() => deleteUser(id))}
        />
      )}

      {activeTab === "export" && (
        <Card
          title="Export Assets"
          subtitle="Download a CSV of assets using the site filter above"
        >
          <p className="mb-4 text-sm text-gray-600">
            {siteFilterName
              ? `Export will include assets at ${siteFilterName}.`
              : "Export will include assets from all sites."}
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Download CSV
          </button>
        </Card>
      )}
    </div>
  );
}

function CategoriesPanel({
  categories,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  categories: AssetCategory[];
  loading: boolean;
  onCreate: (data: { name: string; description?: string }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: { name: string; description?: string },
    previousName: string,
  ) => Promise<boolean>;
  onDelete: (id: string, name: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onCreate({ name, description });
    if (ok) {
      setName("");
      setDescription("");
    }
  }

  return (
    <Card title="Asset Categories" subtitle={`${categories.length} categories`}>
      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add Category
        </button>
      </form>
      <EntityTable
        headers={["Name", "Description", "Actions"]}
        rows={categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            loading={loading}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        emptyMessage="No categories yet."
      />
    </Card>
  );
}

function CategoryRow({
  category,
  loading,
  onUpdate,
  onDelete,
}: {
  category: AssetCategory;
  loading: boolean;
  onUpdate: (
    id: string,
    data: { name: string; description?: string },
    previousName: string,
  ) => Promise<boolean>;
  onDelete: (id: string, name: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");

  async function handleSave() {
    const ok = await onUpdate(category.id, { name, description }, category.name);
    if (ok) setEditing(false);
  }

  return (
    <tr>
      <td className="px-3 py-3 text-sm">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          category.name
        )}
      </td>
      <td className="px-3 py-3 text-sm text-gray-600">
        {editing ? (
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          category.description || "—"
        )}
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <RowActions
          editing={editing}
          loading={loading}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setName(category.name);
            setDescription(category.description ?? "");
            setEditing(false);
          }}
          onSave={handleSave}
          onDelete={() => onDelete(category.id, category.name)}
          deleteLabel="category"
        />
      </td>
    </tr>
  );
}

function SitesPanel({
  sites,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  sites: Site[];
  loading: boolean;
  onCreate: (data: { name: string; address?: string }) => Promise<boolean>;
  onUpdate: (id: string, data: { name: string; address?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onCreate({ name, address });
    if (ok) {
      setName("");
      setAddress("");
    }
  }

  return (
    <Card title="Sites" subtitle={`${sites.length} sites`}>
      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Site name"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add Site
        </button>
      </form>
      <EntityTable
        headers={["Name", "Address", "Actions"]}
        rows={sites.map((site) => (
          <SiteRow
            key={site.id}
            site={site}
            loading={loading}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        emptyMessage="No sites yet."
      />
    </Card>
  );
}

function SiteRow({
  site,
  loading,
  onUpdate,
  onDelete,
}: {
  site: Site;
  loading: boolean;
  onUpdate: (id: string, data: { name: string; address?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(site.name);
  const [address, setAddress] = useState(site.address ?? "");

  async function handleSave() {
    const ok = await onUpdate(site.id, { name, address });
    if (ok) setEditing(false);
  }

  return (
    <tr>
      <td className="px-3 py-3 text-sm">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          site.name
        )}
      </td>
      <td className="px-3 py-3 text-sm text-gray-600">
        {editing ? (
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          site.address || "—"
        )}
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <RowActions
          editing={editing}
          loading={loading}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setName(site.name);
            setAddress(site.address ?? "");
            setEditing(false);
          }}
          onSave={handleSave}
          onDelete={() => onDelete(site.id)}
          deleteLabel="site"
        />
      </td>
    </tr>
  );
}

function LocationsPanel({
  locations,
  sites,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  locations: Location[];
  sites: Site[];
  loading: boolean;
  onCreate: (data: {
    site_id: string;
    name: string;
    description?: string;
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: { site_id: string; name: string; description?: string },
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onCreate({ site_id: siteId, name, description });
    if (ok) {
      setName("");
      setDescription("");
    }
  }

  return (
    <Card title="Locations" subtitle={`${locations.length} locations`}>
      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-4">
        <select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Select site</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Location name"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !siteId}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add Location
        </button>
      </form>
      <EntityTable
        headers={["Site", "Location", "Description", "Actions"]}
        rows={locations.map((location) => (
          <LocationRow
            key={location.id}
            location={location}
            sites={sites}
            loading={loading}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        emptyMessage="No locations yet."
      />
    </Card>
  );
}

function LocationRow({
  location,
  sites,
  loading,
  onUpdate,
  onDelete,
}: {
  location: Location;
  sites: Site[];
  loading: boolean;
  onUpdate: (
    id: string,
    data: { site_id: string; name: string; description?: string },
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [siteId, setSiteId] = useState(location.site_id);
  const [name, setName] = useState(location.name);
  const [description, setDescription] = useState(location.description ?? "");

  async function handleSave() {
    const ok = await onUpdate(location.id, { site_id: siteId, name, description });
    if (ok) setEditing(false);
  }

  return (
    <tr>
      <td className="px-3 py-3 text-sm">
        {editing ? (
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        ) : (
          location.site?.name ?? "—"
        )}
      </td>
      <td className="px-3 py-3 text-sm">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          location.name
        )}
      </td>
      <td className="px-3 py-3 text-sm text-gray-600">
        {editing ? (
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          location.description || "—"
        )}
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <RowActions
          editing={editing}
          loading={loading}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setSiteId(location.site_id);
            setName(location.name);
            setDescription(location.description ?? "");
            setEditing(false);
          }}
          onSave={handleSave}
          onDelete={() => onDelete(location.id)}
          deleteLabel="location"
        />
      </td>
    </tr>
  );
}

function UsersPanel({
  users,
  loading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  users: Profile[];
  loading: boolean;
  onCreate: (data: {
    email: string;
    full_name?: string;
    role: UserRole;
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: { full_name?: string; role: UserRole },
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onCreate({ email, full_name: fullName, role });
    if (ok) {
      setEmail("");
      setFullName("");
      setRole("viewer");
    }
  }

  return (
    <Card title="Users" subtitle={`${users.length} users`}>
      <form onSubmit={handleCreate} className="mb-6 grid gap-3 sm:grid-cols-4">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name (optional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {USER_ROLES.map((userRole) => (
            <option key={userRole} value={userRole}>
              {formatRole(userRole)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Add User
        </button>
      </form>
      <EntityTable
        headers={["Email", "Name", "Role", "Actions"]}
        rows={users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            loading={loading}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        emptyMessage="No users yet."
      />
    </Card>
  );
}

function UserRow({
  user,
  loading,
  onUpdate,
  onDelete,
}: {
  user: Profile;
  loading: boolean;
  onUpdate: (
    id: string,
    data: { full_name?: string; role: UserRole },
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [role, setRole] = useState<UserRole>(user.role);

  async function handleSave() {
    const ok = await onUpdate(user.id, { full_name: fullName, role });
    if (ok) setEditing(false);
  }

  return (
    <tr>
      <td className="px-3 py-3 text-sm">{user.email}</td>
      <td className="px-3 py-3 text-sm">
        {editing ? (
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
        ) : (
          user.full_name || "—"
        )}
      </td>
      <td className="px-3 py-3 text-sm">
        {editing ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
          >
            {USER_ROLES.map((userRole) => (
              <option key={userRole} value={userRole}>
                {formatRole(userRole)}
              </option>
            ))}
          </select>
        ) : (
          formatRole(user.role)
        )}
      </td>
      <td className="px-3 py-3 text-right text-sm">
        <RowActions
          editing={editing}
          loading={loading}
          onEdit={() => setEditing(true)}
          onCancel={() => {
            setFullName(user.full_name ?? "");
            setRole(user.role);
            setEditing(false);
          }}
          onSave={handleSave}
          onDelete={() => onDelete(user.id)}
          deleteLabel="user"
        />
      </td>
    </tr>
  );
}

function EntityTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: ReactNode[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={`px-3 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
                  header === "Actions" ? "text-right" : "text-left"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{rows}</tbody>
      </table>
    </div>
  );
}

function RowActions({
  editing,
  loading,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  deleteLabel,
}: {
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  deleteLabel: string;
}) {
  if (editing) {
    return (
      <div className="space-x-2">
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="font-medium text-gray-900 hover:underline disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-medium text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-x-2">
      <button
        type="button"
        onClick={onEdit}
        className="font-medium text-gray-700 hover:text-gray-900"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm(`Delete this ${deleteLabel}?`)) {
            onDelete();
          }
        }}
        disabled={loading}
        className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
