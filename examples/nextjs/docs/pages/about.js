import Link from 'next/link';

export default function Docs() {
  return (
    <div>
      <p>Hello About Docs</p>
      <Link href="/">
        <a>Go to "docs/"</a>
      </Link>
    </div>
  );
}
