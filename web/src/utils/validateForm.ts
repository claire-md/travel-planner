// Sign up form
// firstName        required
// lastName         required
// email            required
// password         required
// confirmPassword  required

// Login form
// email            required
// password         required

export default function validateForm(formData: any, requiredFields: string[]) {
  for (const field of requiredFields) {
    const value = formData[field];
    if (!value || value === "") {
      return false;
    }
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    return false;
  }

  if (formData.password && formData.password.length < 8) {
    return false;
  }

  if (
    formData.confirmPassword &&
    formData.confirmPassword !== formData.password
  ) {
    return false;
  }

  return true;
}
