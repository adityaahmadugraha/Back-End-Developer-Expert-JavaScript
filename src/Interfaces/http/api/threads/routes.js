import express from 'express';

const createThreadsRouter = (handler, auth) => {
  const router = express.Router();

  router.post('/', auth, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadByIdHandler);

  return router;
};

export default createThreadsRouter;
