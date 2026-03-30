import Link from "next/link";

export default function TalkToAI() {
  return (
    <Link
      href="/ai"
      className="icon-button"
      aria-label="Open AI assistant"
    >
      <SparkleIcon />
    </Link>
  );
}

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
  );
}
