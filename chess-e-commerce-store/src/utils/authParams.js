export function getPasswordResetParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    token: params.get("token") || params.get("reset_token") || "",
    email: params.get("email") || ""
  };
}

export function hasPasswordResetLink() {
  const { token, email } = getPasswordResetParams();
  return Boolean(token && email);
}
