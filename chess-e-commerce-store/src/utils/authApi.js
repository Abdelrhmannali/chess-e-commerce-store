import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const authClient = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function extractError(error) {
  const data = error.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    return Array.isArray(first) ? first[0] : String(first);
  }
  return data?.message || error.message || "فشل الطلب";
}

export async function requestPasswordReset(email) {
  try {
    const { data } = await authClient.post("/forgot-password", { email });
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}

export async function resetPassword({ email, token, password, passwordConfirmation }) {
  try {
    const { data } = await authClient.post("/reset-password", {
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    });
    return data;
  } catch (error) {
    throw new Error(extractError(error));
  }
}
