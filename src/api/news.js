import $apollo from '@/services/apollo';

import ListNewsBookmarked from '@/gql/news/ListNewsBookmarked.gql';
import ListNewsQueued from '@/gql/news/ListNewsQueued.gql';
import ListNewsFollowing from '@/gql/news/ListNewsFollowing.gql';
import ListNewsHistory from '@/gql/news/ListNewsHistory.gql';

import MarkPostViewed from '@/gql/posts/MarkPostViewed.gql';


const followNewsCacheUpdate = (target, cache, mutationResponse) => {
  // NOTE: the follower/following counts are updated by the FollowButton component.
  // The Subscribed news list is refetched by the FollowButton component.
}

const unfollowNewsCacheUpdate = (target, cache, mutationResponse) => {
  // NOTE: the follower/following counts are updated by the FollowButton component.
  // The Subscribed news list is refetched by the FollowButton component.
}

const bookmarkPostCacheUpdate = (post, cache, mutationResponse) => {
  if (post.type !== 'news') return;
  _addToCache({...post, isBookmarked: true}, cache, ListNewsBookmarked);
}
const unbookmarkPostCacheUpdate = (post, cache, mutationResponse) => {
  if (post.type !== 'news') return;
  _removeFromCache(post, cache, ListNewsBookmarked);
}
const queuePostCacheUpdate = (post, cache, mutationResponse) => {
  if (post.type !== 'news') return;
  _addToCache({...post, isQueued: true}, cache, ListNewsQueued);
}
const unqueuePostCacheUpdate = (post, cache, mutationResponse) => {
  if (post.type !== 'news') return;
  _removeFromCache(post, cache, ListNewsQueued);
}

const _addToCache = (post, cache, query) => {
  const queryCache = cache.readQuery({
    query,
  });
  if (queryCache && queryCache.posts) {
    cache.writeQuery({
      query,
      data: {
        posts: [post, ...queryCache.posts],
      },
    });
  }
}
const _removeFromCache = (post, cache, query) => {
  const queryCache = cache.readQuery({
    query,
  });
  if (queryCache && queryCache.posts) {
    cache.writeQuery({
      query,
      data: {
        posts: queryCache.posts.filter((p) => p.id !== post.id),
      },
    });
  }
}

// NOTE: currently we don't update view count for posts viewed from forum posts
// This only gets run from the news module
// If we're not careful, it's possible to create an infinite loop where updating the cache triggers an
// "result" event on the news detail page, which triggers markPostViewed again.
const markPostViewed = async(post) => {
  return $apollo.mutate({
    mutation: MarkPostViewed,
    variables: {
      postId: post.id,
    },
    update: (cache, mutationResponse) => {
      const query = ListNewsHistory;
      const queryCache = cache.readQuery({
        query,
      });
      if (queryCache && queryCache.posts) {
        // If the post is already in the news history cache remove it
        // Add the newly viewed post to the start
        cache.writeQuery({
          query,
          data: {
            posts: [post, ...queryCache.posts.filter((p) => p.id !== post.id)],
          },
        });
      }

      // Increment the view count after adding news to the start of the watched list
      cache.modify({
        id: cache.identify(post),
        fields: {
          viewCount(existingFieldData = 0) {
            return existingFieldData + 1;
          },
        },
      });
    }
  });
}

export default {
  followNewsCacheUpdate,
  unfollowNewsCacheUpdate,
  bookmarkPostCacheUpdate,
  unbookmarkPostCacheUpdate,
  queuePostCacheUpdate,
  unqueuePostCacheUpdate,
  markPostViewed,
}
