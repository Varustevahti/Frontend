export function buildUserHeaders() {
  const uid = globalThis.__clerkUserId || "";
  const email = globalThis.__clerkUserEmail || "";
  const name = globalThis.__clerkUserName || "";

  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-User-Id": uid,
    "X-User-Email": email,
    "X-User-Name": name,
  };
}

export function buildUserHeadersForMultipart() {
  const uid = globalThis.__clerkUserId || "";
  const email = globalThis.__clerkUserEmail || "";
  const name = globalThis.__clerkUserName || "";
  return {
    "Accept": "application/json",
    "X-User-Id": uid,
    "X-User-Email": email,
    "X-User-Name": name,
  };
}