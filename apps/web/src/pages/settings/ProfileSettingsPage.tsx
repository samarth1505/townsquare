import { maskPhone } from "@hub/core";
import { useAuth } from "@/features/auth";

export default function ProfileSettingsPage() {
  const { session } = useAuth();
  if (session === null) return null;

  return (
    <div>
      <h2>Profile</h2>
      <p>Phone number: {maskPhone(session.user.phone)}</p>
    </div>
  );
}
