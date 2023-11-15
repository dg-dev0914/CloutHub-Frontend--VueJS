import $apollo from '@/services/apollo';
import $auth from '@/services/auth';

import $videosApi from '@/api/videos';
import $newsApi from '@/api/news';

// News, Videos features
import BookmarkPost from '@/gql/posts/BookmarkPost.gql';
import ToggleGroupPostPin from '@/gql/posts/ToggleGroupPostPin.gql';
import UnbookmarkPost from '@/gql/posts/UnbookmarkPost.gql';
import QueuePost from '@/gql/posts/QueuePost.gql';
import UnqueuePost from '@/gql/posts/UnqueuePost.gql';

// Forum / Group posts
import InsertPost from '@/gql/posts/InsertPost.gql';
import UpdatePost from '@/gql/posts/UpdatePost.gql';

import ListUserPosts from '@/gql/posts/ListUserPosts.gql';
import ListGroupPosts from '@/gql/posts/ListGroupPosts.gql';
import ListPublicPosts from '@/gql/posts/ListPublicPosts.gql';
import ListFollowingPosts from '@/gql/posts/ListFollowingPosts.gql';
import GetGroup from '@/gql/groups/GetGroup.gql';

import ListPostReactions from '@/gql/posts/ListPostReactions.gql';

import SetPostReaction from '@/gql/posts/SetPostReaction.gql';
import DeletePostReaction from '@/gql/posts/DeletePostReaction.gql';

async function togglePostPin(post) {
  await $apollo.mutate({
    mutation: ToggleGroupPostPin,
    variables: {
      postId: post.id,
    },
    refetchQueries: [
      {
        query: ListGroupPosts,
        variables: { id: post.groupId },
      },
    ],
  });
}

async function bookmarkPost(post) {
  await $apollo.mutate({
    mutation: BookmarkPost,
    variables: {
      postId: post.id,
    },
    optimisticResponse: {
      bookmark_post: true,
    },
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(post),
        fields: {
          isBookmarked() {
            return true;
          },
        },
      });
      $videosApi.bookmarkPostCacheUpdate(post, cache, mutationResponse);
      $newsApi.bookmarkPostCacheUpdate(post, cache, mutationResponse);
    },
  });
}

async function unbookmarkPost(post) {
  await $apollo.mutate({
    mutation: UnbookmarkPost,
    variables: {
      postId: post.id,
    },
    optimisticResponse: {
      unbookmark_post: true,
    },
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(post),
        fields: {
          isBookmarked() {
            return false;
          },
        },
      });
      $videosApi.unbookmarkPostCacheUpdate(post, cache, mutationResponse);
      $newsApi.unbookmarkPostCacheUpdate(post, cache, mutationResponse);
    },
  });
}

async function queuePost(post) {
  await $apollo.mutate({
    mutation: QueuePost,
    variables: {
      postId: post.id,
    },
    optimisticResponse: {},
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(post),
        fields: {
          isQueued() {
            return true;
          },
        },
      });
      $videosApi.queuePostCacheUpdate(post, cache, mutationResponse);
      $newsApi.queuePostCacheUpdate(post, cache, mutationResponse);
    },
  });
}

async function unqueuePost(post) {
  await $apollo.mutate({
    mutation: UnqueuePost,
    variables: {
      postId: post.id,
    },
    optimisticResponse: {},
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(post),
        fields: {
          isQueued() {
            return false;
          },
        },
      });
      $videosApi.unqueuePostCacheUpdate(post, cache, mutationResponse);
      $newsApi.unqueuePostCacheUpdate(post, cache, mutationResponse);
    },
  });
}

const createPost = (post) => {
  return $apollo.mutate({
    mutation: InsertPost,
    variables: post,
    update: (cache, mutationResponse) => {
      _cacheInsertPost(cache, ListUserPosts, { id: $auth.getUserId() }, mutationResponse.data.create_post);
      _cacheInsertPost(cache, ListPublicPosts, {}, mutationResponse.data.create_post);
      _cacheInsertPost(cache, ListFollowingPosts, {}, mutationResponse.data.create_post);
      if (post.groupId) {
        _cacheInsertPost(cache, ListGroupPosts, { id: post.groupId }, mutationResponse.data.create_post);
        _cacheUpdatePost(cache, GetGroup, { id: post.groupId });
      }
    },
  });
}

const _cacheInsertPost = (cache, query, params, post) => {
  const cachedData = cache.readQuery({
    query,
    variables: params,
  });
  if (cachedData && cachedData.posts) {
    cache.writeQuery({
      query,
      variables: params,
      data: {
        posts: [post, ...cachedData.posts],
      },
    });
  }
};

const _cacheUpdatePost = (cache, query, variables) => {
  const cachedData = cache.readQuery({
    query,
    variables,
  });
  if (cachedData && cachedData.group) {
    cache.writeQuery({
      query,
      variables,
      data: {
        group: {
          ...cachedData.group,
          postCount: cachedData.group.postCount + 1,
        },
      },
    });
  }
};

const updatePost = (post) =>
  $apollo.mutate({
    mutation: UpdatePost,
    variables: post,
  });

const _updateReactionSummary = (existingFieldData, vars) => {
  const newData = [];
  let found = false;
  let dataToPush;
  existingFieldData.forEach((summary) => {
    dataToPush = summary;
    if (summary.type === vars.type) {
      dataToPush = {
        count: summary.count + 1,
        type: summary.type,
      };
      found = true;
    }
    newData.push(dataToPush);
  });
  if (!found) {
    newData.push({
      count: 1,
      type: vars.type,
    });
  }
  return newData;
};

const reactPost = async (post, reaction) => {
  const vars = {
    postId: post.id,
    type: reaction,
  };
  await $apollo.mutate({
    mutation: SetPostReaction,
    variables: vars,
    optimisticResponse: {
      react_post: {
        ...vars,
        id: Date.now(),
        __typename: 'PostReaction',
      },
    },
    update: (cache, mutationResponse) => {
      const query = ListPostReactions;
      const queryVariableTypes = [null, reaction];
      queryVariableTypes.forEach((type) => {
        const variables = {
          id: post.id,
          type,
        };
        const queryCache = cache.readQuery({
          query,
          variables,
        });
        if (queryCache && queryCache.list_post_reactions) {
          const userId = $auth.getUserId();
          cache.writeQuery({
            query,
            variables,
            data: {
              list_post_reactions: [
                mutationResponse.data.react_post,
                ...queryCache.list_post_reactions,
              ],
            },
          });
        }
      });

      cache.modify({
        id: cache.identify(post),
        fields: {
          reactionSummary: (existingFieldData) =>
            _updateReactionSummary(existingFieldData, vars),
          reactionCount: (existingFieldData) => (existingFieldData || 0) + 1,
          myReaction: (existingFieldData, { toReference }) =>
            toReference(cache.identify(mutationResponse.data.react_post)),
        },
      });
    },
  });
};

const _updateUnreactionSummary = (existingFieldData, myReaction) => {
  const newData = existingFieldData.map((data) => {
    if (data.type === myReaction.type) {
      return {
        count: data.count - 1,
        type: data.type,
      };
    }
    return data;
  });
  return newData;
};

const unreactPost = async (post) => {
  const myReaction = { ...post.myReaction };
  return $apollo.mutate({
    mutation: DeletePostReaction,
    variables: {
      postId: post.id,
    },
    optimisticResponse: {
      unreact_post: true,
    },
    update: (cache) => {
      const query = ListPostReactions;
      const queryVariableTypes = [null, myReaction.type];
      queryVariableTypes.forEach((type) => {
        const variables = {
          id: post.id,
          type,
        };
        const queryCache = cache.readQuery({
          query,
          variables,
        });
        if (queryCache && queryCache.list_post_reactions) {
          const userId = $auth.getUserId();
          cache.writeQuery({
            query,
            variables,
            data: {
              list_post_reactions: queryCache.list_post_reactions.filter(
                (reaction) => reaction.userId !== userId
              ),
            },
          });
        }
      });

      cache.modify({
        id: cache.identify(post),
        fields: {
          reactionSummary: (existingFieldData) =>
            _updateUnreactionSummary(existingFieldData, myReaction),
          reactionCount: (existingFieldData) => existingFieldData - 1,
          myReaction: () => null,
        },
      });
    },
  });
};

export default {
  togglePostPin,
  bookmarkPost,
  unbookmarkPost,
  queuePost,
  unqueuePost,
  createPost,
  updatePost,
  reactPost,
  unreactPost,
};
