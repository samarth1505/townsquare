import Link from "next/link";

export default function PostNotFound() {
  return (
    <>
      <h1>Post not found</h1>
      <p>That tip doesn't exist (or was removed).</p>
      <Link href="/explore">Browse all tips</Link>
    </>
  );
}
