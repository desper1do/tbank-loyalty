import { useState } from "react";
import LoyaltyScreen from "./screens/LoyaltyScreen";
import UsersScreen from "./screens/UsersScreen";
import { User } from "./types";

export default function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (selectedUser)
    return <LoyaltyScreen user={selectedUser} onBack={() => setSelectedUser(null)} />;

  return <UsersScreen onSelect={setSelectedUser} />;
}
