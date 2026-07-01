export function AuthFormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-gray-100" />
        <div className="h-10 w-full rounded-md bg-gray-100" />
      </div>
      <div className="h-10 w-full rounded-md bg-gray-200" />
    </div>
  );
}
