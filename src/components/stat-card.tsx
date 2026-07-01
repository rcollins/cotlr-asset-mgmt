import Link from "next/link";

type StatCardProps = {
  title: string;
  value: number;
  label: string;
  href?: string;
};

function StatCardContent({
  title,
  value,
  label,
}: Pick<StatCardProps, "title" | "value" | "label">) {
  return (
    <>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </>
  );
}

const cardClassName =
  "rounded-lg border border-gray-200 bg-white p-6 shadow-sm";

export function StatCard({ title, value, label, href }: StatCardProps) {
  const content = <StatCardContent title={title} value={value} label={label} />;

  if (href) {
    return (
      <Link
        href={href}
        className={`${cardClassName} block transition-colors hover:border-gray-300 hover:bg-gray-50`}
      >
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
