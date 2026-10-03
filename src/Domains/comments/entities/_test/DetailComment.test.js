import DetailComment from '../DetailComment.js';

describe('DetailComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: 'false',
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw error when replies is not an array', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: false,
      replies: {},
    };

    expect(() => new DetailComment(payload)).toThrowError(
      'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create DetailComment entities correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: false,
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual('comment-123');
    expect(detailComment.username).toEqual('dicoding');
    expect(detailComment.date).toEqual('2021-08-08T07:22:33.555Z');
    expect(detailComment.content).toEqual('sebuah comment');
    expect(detailComment.replies).toEqual([]);
    expect(detailComment.isDelete).toBeUndefined();
  });

  it('should replace content when comment is deleted', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
      isDelete: true,
      replies: [],
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment.content).toEqual('**komentar telah dihapus**');
  });
});
