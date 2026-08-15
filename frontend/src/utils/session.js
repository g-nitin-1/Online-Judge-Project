export function getStoredUser() {
  try {
    const value = localStorage.getItem("UserData");
    const user = value ? JSON.parse(value) : null;
    return user?.token ? user : null;
  } catch {
    localStorage.removeItem("UserData");
    return null;
  }
}
