const BACKEND_URL = "http://127.0.0.1:8000/api/auth";

export async function sendSignInRequest(data: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${BACKEND_URL}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }

  return await res.json();
}

export async function sendSignUpRequest(data: {
    name: string;
    email: string; 
    password: string;
}) {
  const res = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    return await res.json();
}
