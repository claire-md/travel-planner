// Sign up form
// firstName        required
// lastName         required
// email            required
// password         required
// confirmPassword  required

// Login form
// email            required
// password         required

export default function validateForm(
  data: unknown,
  requiredFields: string[],
) {
  const formData = (data ?? {}) as Record<string, unknown>;

  for (const field of requiredFields) {
    const value = formData[field];
    if (!value || value === "") {
      return false;
    }
  }

  const { email, password, confirmPassword } = formData;

  if (
    typeof email === "string" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return false;
  }

  if (typeof password === "string" && password.length < 8) {
    return false;
  }

  if (confirmPassword && confirmPassword !== password) {
    return false;
  }

  return true;
}
