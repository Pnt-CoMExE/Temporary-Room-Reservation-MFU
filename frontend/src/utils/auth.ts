export function getStoredUserId(): number | null {
  const id = localStorage.getItem("userId");
  if (!id) return null;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getStoredUserEmail(): string | null {
  return localStorage.getItem("userEmail");
}

export function isLoggedIn(): boolean {
  // UI session flag only — authoritative auth is HttpOnly cookie mfu_token on the API
  return localStorage.getItem("isLoggedIn") === "true";
}

export function clearAuthSession(): void {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
}
