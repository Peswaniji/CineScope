export const handleControllerError = (res, scope, error, userMessage) => {
  console.error(`${scope} error:`, error);
  return res.status(500).json({ message: userMessage });
};

