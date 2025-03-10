type User = { personaId: string; email: string; name: string; googleId: string; isLoggedIn: boolean };

const users: User[] = [];

export async function findUserByEmail(email: string) {
  return users.find((user) => user.email === email) || null;
}

export async function createUser({ email, name, googleId }: Omit<User, "personaId" | "isLoggedIn">) {
  const newUser = { personaId: crypto.randomUUID(), email, name, googleId, isLoggedIn: true };
  users.push(newUser);
  return newUser;
}

export async function notifySecurityAlert(user: User) {
  console.log(`Security alert for ${user.email}`);
}
