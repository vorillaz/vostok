import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js micro apps with Vostok</h1>
      <p>Hello Homepage</p>
      <p>
        <Link href="/documentation">
          <a>Go to Docs</a>
        </Link>
      </p>
    </div>
  );
}
