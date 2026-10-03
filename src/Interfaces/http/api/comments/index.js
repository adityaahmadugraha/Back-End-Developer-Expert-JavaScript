import CommentsHandler from './handler.js';
import createCommentsRouter from './routes.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

export default (container) => {
  const commentsHandler = new CommentsHandler(container);
  return createCommentsRouter(commentsHandler, authMiddleware(container));
};
