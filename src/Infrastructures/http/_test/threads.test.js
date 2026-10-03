import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ServerTestHelper from '../../../../tests/ServerTestHelper.js';

describe('/threads endpoint', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');

      const threads = await ThreadsTableTestHelper.findThreadsById(
        response.body.data.addedThread.id,
      );
      expect(threads).toHaveLength(1);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const app = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 123, body: true });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual(
        'tidak dapat membuat thread baru karena tipe data tidak sesuai',
      );
    });

    it('should response 401 when request without access token', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 401 when access token is invalid', async () => {
      const app = await createServer(container);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Bearer invalid_token')
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail with comments', async () => {
      const app = await createServer(container);
      const ownerToken = await ServerTestHelper.getAccessToken(app);
      const otherToken = await ServerTestHelper.getAccessToken(app, { username: 'johndoe' });

      const threadResponse = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: 'sebuah comment' });
      console.log('COMMENT RESPONSE:', commentResponse.status, commentResponse.body);
      const activeCommentId = commentResponse.body.data.addedComment.id;

      const deletedCommentResponse = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'komentar yang akan dihapus' });
      const deletedCommentId = deletedCommentResponse.body.data.addedComment.id;

      await request(app)
        .delete(`/threads/${threadId}/comments/${deletedCommentId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      const response = await request(app).get(`/threads/${threadId}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const { thread } = response.body.data;
      expect(thread.id).toEqual(threadId);
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body thread');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toBeDefined();
      expect(thread.comments).toHaveLength(2);

      const activeComment = thread.comments.find((comment) => comment.id === activeCommentId);
      expect(activeComment.username).toEqual('johndoe');
      expect(activeComment.content).toEqual('sebuah comment');

      const deletedComment = thread.comments.find((comment) => comment.id === deletedCommentId);
      expect(deletedComment.username).toEqual('dicoding');
      expect(deletedComment.content).toEqual('**komentar telah dihapus**');
    });

    it('should response 404 when thread not found', async () => {
      const app = await createServer(container);

      const response = await request(app).get('/threads/thread-xxx');

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
