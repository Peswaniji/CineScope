export const toUserMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const raw =
    error?.response?.data?.message ||
    error?.message ||
    '';

  const message = String(raw).toLowerCase();

  if (message.includes('password') && (message.includes('minimum') || message.includes('shorter') || message.includes('at least'))) {
    return 'Password must be at least 6 characters.';
  }

  if (message.includes('invalid email or password')) {
    return 'Invalid email or password.';
  }

  if (message.includes('user already exists')) {
    return 'An account with this email already exists.';
  }

  if (message.includes('not authorized as an admin')) {
    return 'You do not have admin access.';
  }

  if (message.includes('token failed') || message.includes('no token')) {
    return 'Session expired. Please log in again.';
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot connect to server. Please try again.';
  }

  if (message.includes('banned')) {
    return 'Your account is currently restricted. Contact support.';
  }

  return raw ? String(raw) : fallback;
};
