import $auth from '@/services/auth';
import $apollo from '@/services/apollo';

// Channel videos for any user including self
import ListUserVideos from '@/gql/videos/ListUserVideos.gql';

// CHANNELS: Live, Recommended, Followed
import ListLiveChannels from '@/gql/videos/ListLiveChannels.gql';
import ListFeaturedChannels from '@/gql/videos/ListFeaturedChannels.gql';
import ListFollowingChannels from '@/gql/videos/ListFollowingChannels.gql';

// VIDEOS:  Latest, Popular, Recently Watched, Bookmarked, Watch Later, From Followed
import ListRecentVideos from '@/gql/videos/ListRecentVideos.gql';
import ListPopularVideos from '@/gql/videos/ListPopularVideos.gql';
import ListWatchedVideos from '@/gql/videos/ListWatchedVideos.gql';
import ListBookmarkedVideos from '@/gql/videos/ListBookmarkedVideos.gql';
import ListQueuedVideos from '@/gql/videos/ListQueuedVideos.gql';
import ListFollowingVideos from '@/gql/videos/ListFollowingVideos.gql';

// CATEGORIES:
import ListCategoryVideos from '@/gql/videos/ListCategoryVideos.gql';
import PinUnpinUserVideo from '@/gql/videos/PinUnpinUserVideo.gql';

// Create/Update/Delete/Viewed Video
import InsertPost from '@/gql/posts/InsertPost.gql';
import UpdatePost from '@/gql/posts/UpdatePost.gql';
import DeletePost from '@/gql/posts/DeletePost.gql';
import MarkPostViewed from '@/gql/posts/MarkPostViewed.gql';

// Update Channel
import UpdateUserProfile from '@/gql/general/UpdateUserProfile.gql';

const createVideo = async (video) =>
  $apollo.mutate({
    mutation: InsertPost,
    variables: video,
    update: (cache, mutationResponse) => {
      const updateLists = [
        ListUserVideos,
        ListRecentVideos,
        ListCategoryVideos,
      ];
      updateLists.forEach((query) => {
        let variables = {};
        if (query === ListUserVideos) variables = { userId: $auth.getUserId() };
        if (query === ListCategoryVideos)
          variables = { category: video.category };
        const queryCache = cache.readQuery({
          query,
          variables,
        });
        if (queryCache && queryCache.videos) {
          cache.writeQuery({
            query,
            variables,
            data: {
              videos: [mutationResponse.data.create_post, ...queryCache.videos],
            },
          });
        }
      });
      // TODO increase video count on create video
      // Currently uneeded as we don't display video count anywhere
    },
  });

const updateVideo = async (video, oldVideo) =>
  $apollo.mutate({
    mutation: UpdatePost,
    variables: video,
    optimisticResponse: {
      update_post: {
        __typename: 'Post',
        ...video,
      },
    },
    update: (cache, mutationResponse) => {
      if (video.category === oldVideo.category) return;

      // Remove video from old category
      const oldVariables = {
        category: oldVideo.category,
      };
      const oldQueryCache = cache.readQuery({
        query: ListCategoryVideos,
        variables: oldVariables,
      });
      if (oldQueryCache && oldQueryCache.videos) {
        cache.writeQuery({
          query: ListCategoryVideos,
          variables: oldVariables,
          data: {
            videos: oldQueryCache.videos.filter((v) => v.id !== oldVideo.id),
          },
        });
      }

      // Add video to new category
      const variables = {
        category: video.category,
      };
      const queryCache = cache.readQuery({
        query: ListCategoryVideos,
        variables,
      });
      if (queryCache && queryCache.videos) {
        cache.writeQuery({
          query: ListCategoryVideos,
          variables,
          data: {
            videos: [mutationResponse.data.update_post, ...queryCache.videos],
          },
        });
      }
    },
  });

const deleteVideo = async (video) =>
  $apollo.mutate({
    mutation: DeletePost,
    variables: {
      postId: video.id,
    },
    update: (cache, mutationResponse) => {
      const normalizedId = cache.identify(video);
      cache.evict({ id: normalizedId });
      cache.gc();
      // TODO decrease video count on delete video
      // Currently uneeded as we don't display video count anywhere
    },
  });

const bookmarkPostCacheUpdate = (video, cache, mutationResponse) => {
  if (video.type !== 'video') return;
  _addToCache({ ...video, isBookmarked: true }, cache, ListBookmarkedVideos);
};
const unbookmarkPostCacheUpdate = (video, cache, mutationResponse) => {
  if (video.type !== 'video') return;
  _removeFromCache(video, cache, ListBookmarkedVideos);
};
const queuePostCacheUpdate = (video, cache, mutationResponse) => {
  if (video.type !== 'video') return;
  _addToCache({ ...video, isQueued: true }, cache, ListQueuedVideos);
};
const unqueuePostCacheUpdate = (video, cache, mutationResponse) => {
  if (video.type !== 'video') return;
  _removeFromCache(video, cache, ListQueuedVideos);
};

const _addToCache = (video, cache, query) => {
  const queryCache = cache.readQuery({
    query,
  });
  if (queryCache && queryCache.videos) {
    cache.writeQuery({
      query,
      data: {
        videos: [video, ...queryCache.videos],
      },
    });
  }
};
const _removeFromCache = (video, cache, query) => {
  const queryCache = cache.readQuery({
    query,
  });
  if (queryCache && queryCache.videos) {
    cache.writeQuery({
      query,
      data: {
        videos: queryCache.videos.filter((v) => v.id !== video.id),
      },
    });
  }
};

// NOTE: currently we don't update view count for videos viewed from forum posts
// This only gets run from the videos module
// If we're not careful, it's possible to create an infinite loop where updating the cache triggers an
// "result" event on the video detail page, which triggers markVideoViewed again.
const markVideoViewed = async (video) =>
  $apollo.mutate({
    mutation: MarkPostViewed,
    variables: {
      postId: video.id,
    },
    update: (cache, mutationResponse) => {
      const query = ListWatchedVideos;
      const queryCache = cache.readQuery({
        query,
      });
      if (queryCache && queryCache.videos) {
        // If the video is already in the watched videos cache remove it
        // Add the newly watched video to the start
        cache.writeQuery({
          query,
          data: {
            videos: [
              video,
              ...queryCache.videos.filter((v) => v.id !== video.id),
            ],
          },
        });
      }

      // Increment the view count after adding video to the start of the watched list
      cache.modify({
        id: cache.identify(video),
        fields: {
          viewCount(existingFieldData = 0) {
            return existingFieldData + 1;
          },
        },
      });
    },
  });

const updateChannel = async (channel) =>
  $apollo.mutate({
    mutation: UpdateUserProfile,
    variables: channel,
    update: (cache, mutationResponse) => {
      cache.modify({
        id: cache.identify(channel),
        fields: {
          channelName() {
            return channel.channelName;
          },
          channelPicture() {
            return channel.channelPicture;
          },
          channelCover() {
            return channel.channelCover;
          },
          channelDescription() {
            return channel.channelDescription;
          },
          channelButtonLink() {
            return channel.channelButtonLink;
          },
          channelButtonLabel() {
            return channel.channelButtonLabel;
          },
        },
      });
    },
  });

const followChannelCacheUpdate = async (channel, cache, mutationResponse) => {
  // NOTE: the follower/following counts are updated by the FollowButton component.
  // The FromFollowed videos list is refetched by the FollowButton component.
  // This is to manage the cache for the channels lists related to who the user follows.
  // This is called from api/connections.js
  const query = ListFollowingChannels;
  const queryCache = cache.readQuery({
    query,
  });
  if (queryCache && queryCache.users) {
    cache.writeQuery({
      query,
      data: {
        users: [channel, ...queryCache.users],
      },
    });
  }
};

const unfollowChannelCacheUpdate = async (channel, cache, mutationResponse) => {
  // NOTE: the follower/following counts are updated by the FollowButton component.
  // The FromFollowed videos list is refetched by the FollowButton component.
  // This is to manage the cache for the channels lists related to who the user follows.
  // This is called from api/connections.js
  const query = ListFollowingChannels;
  const queryCache = cache.readQuery({
    query,
  });
  if (queryCache && queryCache.users) {
    cache.writeQuery({
      query,
      data: {
        users: queryCache.users.filter((ch) => ch.id !== channel.id),
      },
    });
  }
};

const pinUnpinUserVideo = async (postId, isPinnedOnChannel) =>
  $apollo.mutate({
    mutation: PinUnpinUserVideo,
    variables: {
      postId, isPinnedOnChannel
    },
    update: (cache, mutationResponse) => {
      cache.gc();
    },
  });

export default {
  createVideo,
  updateVideo,
  deleteVideo,
  bookmarkPostCacheUpdate,
  unbookmarkPostCacheUpdate,
  queuePostCacheUpdate,
  unqueuePostCacheUpdate,
  markVideoViewed,
  updateChannel,
  followChannelCacheUpdate,
  unfollowChannelCacheUpdate,
  pinUnpinUserVideo
};
