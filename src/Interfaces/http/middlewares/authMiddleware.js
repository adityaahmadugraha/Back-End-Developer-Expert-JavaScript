import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authMiddleware = (container) => async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authorization.split(' ')[1];
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);

    await tokenManager.verifyAccessToken(token);
    const { id } = await tokenManager.decodePayload(token);

    req.auth = { credentials: { id } };
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
