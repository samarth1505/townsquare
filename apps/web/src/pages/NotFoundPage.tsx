import { Link } from "react-router";
import { Main } from "@/shared/components";
import { ROUTES } from "@/shared/lib/routes";

export default function NotFoundPage() {
  return (
    <Main>
      <h1>Page not found</h1>
      <p>The page you are looking for doesn't exist.</p>
      <Link to={ROUTES.home}>Go to home</Link>
    </Main>
  );
}
