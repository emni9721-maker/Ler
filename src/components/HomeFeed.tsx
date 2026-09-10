import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Users,
  Lock,
  Plus,
  Play,
  Send,
  Sparkles,
  Shield,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Post, Story, User, Comment, UserStoryGroup } from '../types';

interface HomeFeedProps {
  currentUser: User;
  posts: Post[];
  stories: (Story | UserStoryGroup)[];
  onOpenStory?: (index: number) => void;
  onOpenStoryViewer?: (group: UserStoryGroup) => void;
  onOpenCreateStory?: () => void;
  onOpenCreatePost?: () => void;
  onLikePost?: (postId: string) => void;
  onToggleLike?: (postId: string) => void;
  onCommentPost?: (postId: string, text: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onSavePost?: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
  onSharePost?: (postId: string) => void;
  onBlockUser?: (userId: string) => void;
  onReportUser?: (userId: string) => void;
  onSelectUser?: (userId: string) => void;
  onOpenUserProfile?: (userId: string) => void;
  onToggleFollow?: (userId: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  currentUser,
  posts,
  stories,
  onOpenStory,
  onOpenStoryViewer,
  onOpenCreateStory,
  onOpenCreatePost,
  onLikePost,
  onToggleLike,
  onCommentPost,
  onAddComment,
  onSavePost,
  onToggleSave,
  onSharePost,
  onBlockUser,
  onReportUser,
  onSelectUser,
  onOpenUserProfile,
}) => {
  const [feedFilter, setFeedFilter] = useState<'all' | 'friends' | 'saved'>('all');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [shareToastPostId, setShareToastPostId] = useState<string | null>(null);
  const [doubleTapHeartPostId, setDoubleTapHeartPostId] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    if (onLikePost) onLikePost(postId);
    else if (onToggleLike) onToggleLike(postId);
  };

  const handleComment = (postId: string, text: string) => {
    if (onCommentPost) onCommentPost(postId, text);
    else if (onAddComment) onAddComment(postId, text);
  };

  const handleSave = (postId: string) => {
    if (onSavePost) onSavePost(postId);
    else if (onToggleSave) onToggleSave(postId);
  };

  const handleUserSelect = (userId: string) => {
    if (onSelectUser) onSelectUser(userId);
    else if (onOpenUserProfile) onOpenUserProfile(userId);
  };

  const handleBlock = (userId: string) => {
    if (onBlockUser) onBlockUser(userId);
  };

  const handleReport = (userId: string) => {
    if (onReportUser) onReportUser(userId);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const currentUid = currentUser?.id || '';
    if (feedFilter === 'friends') {
      const friendsList = currentUser?.friends || [];
      return post.userId === currentUid || friendsList.includes(post.userId);
    }
    if (feedFilter === 'saved') {
      return (post.savedBy || []).includes(currentUid);
    }
    return true;
  });

  const handleDoubleTap = (postId: string) => {
    handleLike(postId);
    setDoubleTapHeartPostId(postId);
    setTimeout(() => setDoubleTapHeartPostId(null), 900);
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    handleComment(postId, commentInput.trim());
    setCommentInput('');
  };

  const handleShare = (postId: string) => {
    if (onSharePost) onSharePost(postId);
    setShareToastPostId(postId);
    navigator.clipboard?.writeText?.(window.location.href);
    setTimeout(() => setShareToastPostId(null), 2500);
  };

  const activeCommentsPost = posts.find((p) => p.id === activeCommentsPostId);

  return (
    <div id="zero-home-feed" className="flex-1 overflow-y-auto pb-20 select-none bg-[#0c0e12]">
      {/* 1. Stories Tray */}
      <div className="pt-3 pb-2 px-4 border-b border-neutral-800/60 bg-[#0c0e12]/60">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Add your story */}
          <button
            id="add-story-btn"
            onClick={onOpenCreateStory || onOpenCreatePost}
            className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
          >
            <div className="relative w-15 h-15 rounded-full p-[2px] border-2 border-dashed border-emerald-500/70 group-hover:border-emerald-400 transition-colors flex items-center justify-center">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center border-2 border-[#0c0e12]">
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
            </div>
            <span className="text-[11px] text-neutral-300 font-medium tracking-tight">Your Story</span>
          </button>

          {/* Active Stories */}
          {stories.map((storyItem: any, idx: number) => {
            const hasViewed =
              storyItem.hasUnseen !== undefined
                ? !storyItem.hasUnseen
                : (storyItem.viewers || []).includes(currentUser?.id || '');
            const storyUser = storyItem.user || currentUser;
            const uniqueStoryKey =
              storyItem.id ||
              storyItem.user?.id ||
              storyItem.userId ||
              (storyItem.stories && storyItem.stories[0]?.id) ||
              `story-tray-item-${idx}`;

            return (
              <button
                key={uniqueStoryKey}
                onClick={() => {
                  if (onOpenStoryViewer && storyItem.stories) {
                    onOpenStoryViewer(storyItem);
                  } else if (onOpenStory) {
                    onOpenStory(idx);
                  }
                }}
                className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
              >
                <div
                  className={`w-15 h-15 rounded-full p-[2.5px] transition-transform group-active:scale-95 ${
                    hasViewed
                      ? 'border-2 border-neutral-700'
                      : 'bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500'
                  }`}
                >
                  <img
                    src={storyUser.avatarUrl}
                    alt={storyUser.displayName}
                    className="w-full h-full rounded-full object-cover border border-[#0c0e12]"
                  />
                </div>
                <span className="text-[11px] text-neutral-300 font-medium tracking-tight truncate max-w-[64px]">
                  {(storyUser.displayName || 'User').split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Status Composer */}
      <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 shadow-sm flex items-center gap-3">
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.displayName}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700"
        />
        <button
          id="quick-status-composer-btn"
          onClick={onOpenCreatePost}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/40 text-neutral-400 text-xs font-medium transition-colors cursor-pointer"
        >
          Share a photo, thought, or vault moment...
        </button>
      </div>

      {/* 3. Feed Navigation Filter Chips */}
      <div className="flex items-center gap-2 px-4 mt-4 mb-2">
        <button
          onClick={() => setFeedFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            feedFilter === 'all'
              ? 'bg-neutral-100 text-neutral-950 font-semibold shadow'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800/60'
          }`}
        >
          All Feed
        </button>
        <button
          onClick={() => setFeedFilter('friends')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            feedFilter === 'friends'
              ? 'bg-neutral-100 text-neutral-950 font-semibold shadow'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800/60'
          }`}
        >
          Friends ({currentUser.friends.length})
        </button>
        <button
          onClick={() => setFeedFilter('saved')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            feedFilter === 'saved'
              ? 'bg-neutral-100 text-neutral-950 font-semibold shadow'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800/60'
          }`}
        >
          Saved Bookmarks
        </button>
      </div>

      {/* 4. Posts Stream */}
      <div className="space-y-4 px-4 mt-2">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-neutral-900/30 rounded-3xl border border-neutral-800/50">
            <Sparkles className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-neutral-300">No posts in this feed yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              {feedFilter === 'saved' ? 'Save posts to view them here' : 'Share your first post or add friends to see updates!'}
            </p>
            <button
              onClick={onOpenCreatePost}
              className="mt-4 px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Create Post
            </button>
          </div>
        ) : (
          filteredPosts.map((post, postIdx) => {
            const currentUid = currentUser?.id || '';
            const isLiked = (post.likes || []).includes(currentUid);
            const isSaved = (post.savedBy || []).includes(currentUid);
            const isAuthor = post.userId === currentUid;
            const postKey = post.id || `feed-post-${postIdx}`;

            return (
              <article
                key={postKey}
                id={`post-card-${post.id}`}
                className="bg-neutral-900/70 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-sm hover:border-neutral-700/60 transition-colors"
              >
                {/* Post Header */}
                <div className="p-3.5 flex items-center justify-between">
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => handleUserSelect(post.userId)}
                  >
                    <img
                      src={post.user.avatarUrl}
                      alt={post.user.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-neutral-100 hover:text-emerald-400 transition-colors">
                          {post.user.displayName}
                        </span>
                        {post.user.isVerified && (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span>@{post.user.username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {post.privacy === 'public' && <Globe className="w-3 h-3 text-neutral-400" />}
                          {post.privacy === 'friends' && <Users className="w-3 h-3 text-emerald-400" />}
                          {post.privacy === 'private' && <Lock className="w-3 h-3 text-amber-400" />}
                          <span className="capitalize">{post.privacy}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Options Menu Toggle */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenPostId(menuOpenPostId === post.id ? null : post.id)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {menuOpenPostId === post.id && (
                      <div className="absolute right-0 top-8 w-44 bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl z-30 py-1 text-xs">
                        <button
                          onClick={() => {
                            handleSave(post.id);
                            setMenuOpenPostId(null);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center gap-2 text-neutral-200 cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          {isSaved ? 'Remove from Saved' : 'Save Post'}
                        </button>
                        <button
                          onClick={() => {
                            handleShare(post.id);
                            setMenuOpenPostId(null);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center gap-2 text-neutral-200 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Share Post
                        </button>
                        {!isAuthor && (
                          <>
                            <div className="border-t border-neutral-800 my-1" />
                            <button
                              onClick={() => {
                                handleReport(post.userId);
                                setMenuOpenPostId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center gap-2 text-amber-400 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Report Post
                            </button>
                            <button
                              onClick={() => {
                                handleBlock(post.userId);
                                setMenuOpenPostId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center gap-2 text-rose-400 cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              Block User
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="px-3.5 pb-3 text-xs leading-relaxed text-neutral-200 font-normal">
                    {post.content}
                  </p>
                )}

                {/* Post Media (Image/Video) with Double Tap to Like */}
                {post.media && post.media.length > 0 && (
                  <div
                    className="relative w-full aspect-[4/3] bg-black overflow-hidden cursor-pointer"
                    onDoubleClick={() => handleDoubleTap(post.id)}
                  >
                    {post.media[0].type === 'video' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          src={post.media[0].url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <img
                        src={post.media[0].url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Double-tap animated heart overlay */}
                    {doubleTapHeartPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-ping">
                        <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                      </div>
                    )}

                    {/* Media badge */}
                    {post.media[0].type === 'video' && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white flex items-center gap-1 font-mono">
                        <Play className="w-2.5 h-2.5 fill-white" /> VIDEO
                      </div>
                    )}
                  </div>
                )}

                {/* Post Actions Bar */}
                <div className="px-3.5 py-2.5 flex items-center justify-between border-t border-neutral-800/60">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer group"
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform group-active:scale-125 ${
                          isLiked
                            ? 'text-rose-500 fill-rose-500'
                            : 'text-neutral-400 group-hover:text-neutral-200'
                        }`}
                      />
                      <span className={isLiked ? 'text-rose-500' : 'text-neutral-400'}>
                        {post.likes.length}
                      </span>
                    </button>

                    {/* Comments button */}
                    <button
                      onClick={() =>
                        setActiveCommentsPostId(
                          activeCommentsPostId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments.length}</span>
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.sharesCount}</span>
                    </button>
                  </div>

                  {/* Bookmark Save */}
                  <button
                    onClick={() => handleSave(post.id)}
                    className="text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title={isSaved ? 'Remove Bookmark' : 'Bookmark Post'}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        isSaved ? 'text-emerald-400 fill-emerald-400' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Share Toast */}
                {shareToastPostId === post.id && (
                  <div className="px-3.5 py-1 text-[11px] text-emerald-400 bg-emerald-950/30 border-t border-emerald-800/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Link copied to clipboard & shared!
                  </div>
                )}

                {/* Inline Comment Preview */}
                {post.comments.length > 0 && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-neutral-800/40 text-xs">
                    <div className="text-neutral-300">
                      <span className="font-semibold text-white mr-1.5">
                        {post.comments[post.comments.length - 1].user.displayName}:
                      </span>
                      <span className="text-neutral-400">
                        {post.comments[post.comments.length - 1].text}
                      </span>
                    </div>
                    {post.comments.length > 1 && (
                      <button
                        onClick={() => setActiveCommentsPostId(post.id)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-300 mt-1 cursor-pointer font-medium"
                      >
                        View all {post.comments.length} comments
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* 5. Comments Modal / Drawer */}
      {activeCommentsPost && (
        <div
          id="comments-drawer-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setActiveCommentsPostId(null)}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 border-t border-neutral-800 rounded-t-3xl p-4 max-h-[75vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white">
                Comments ({activeCommentsPost.comments.length})
              </h3>
              <button
                onClick={() => setActiveCommentsPostId(null)}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {activeCommentsPost.comments.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                activeCommentsPost.comments.map((comment: Comment, cIdx: number) => (
                  <div key={comment.id || `comment-item-${cIdx}`} className="flex items-start gap-2.5">
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.displayName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-700 shrink-0"
                    />
                    <div className="flex-1 bg-neutral-800/60 rounded-2xl px-3 py-2 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-neutral-200">
                          {comment.user.displayName}
                        </span>
                        <span className="text-[10px] text-neutral-500">Just now</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Composer */}
            <form
              onSubmit={(e) => handleCommentSubmit(activeCommentsPost.id, e)}
              className="pt-2 flex items-center gap-2 border-t border-neutral-800"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <input
                type="text"
                placeholder="Add a comment on ZERO..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-neutral-800/80 rounded-full px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
