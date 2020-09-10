import Link from 'next/link';

export default function Docs() {
  return (
    <div>
      <p>Hello Docs</p>
      <p>
        <Link href="/about">
          <a>
            Go to <strong>docs/about</strong>
          </a>
        </Link>
      </p>
      <p>
        <a href="/">Return to home</a>
      </p>
    </div>
  );
}
