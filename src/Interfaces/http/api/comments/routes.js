import express from 'express';

const createCommentsRouter = (handler, auth) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', auth, handler.postCommentHandler);
  router.delete('/:commentId', auth, handler.deleteCommentHandler);

  return router;
};

export default createCommentsRouter;
