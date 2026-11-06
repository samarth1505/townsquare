// Shown instantly while the explore page's data loads (Next wraps the page in a Suspense boundary with this fallback),
// so navigating here feels immediate instead of freezing on the previous page.
export default function Loading() {
  return (
    <div aria-busy="true">
      <h1>Explore tips</h1>
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
