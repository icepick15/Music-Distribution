import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, ClockIcon, CalendarIcon, EyeIcon,
  ShareIcon 
} from '@heroicons/react/24/outline';
import { 
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/blog/posts/${slug}/`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
      
      // Fetch related posts
      const relatedResponse = await fetch(`http://localhost:8000/api/blog/posts/${slug}/related/`);
      const relatedData = await relatedResponse.json();
      setRelatedPosts(relatedData);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load blog post');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const sharePost = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 transition"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Blog
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative h-96 overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Category */}
            {post.category && (
              <Link
                to={`/blog?category=${post.category.slug}`}
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full mb-4 hover:from-purple-700 hover:to-pink-700 transition"
              >
                {post.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                {post.reading_time}
              </div>
              <div className="flex items-center">
                <EyeIcon className="w-5 h-5 mr-2" />
                {post.views} views
              </div>
              {post.author && (
                <div className="flex items-center">
                  <span className="text-purple-600 font-semibold">
                    By {post.author.first_name || post.author.email}
                  </span>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share this article
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => sharePost('facebook')}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  title="Share on Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => sharePost('twitter')}
                  className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition"
                  title="Share on Twitter"
                >
                  <FaTwitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => sharePost('linkedin')}
                  className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition"
                  title="Share on LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={() => sharePost('whatsapp')}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                  title="Share on WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => sharePost('copy')}
                  className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition"
                  title="Copy Link"
                >
                  <FaCopy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/blog?search=${tag.name}`}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {relatedPost.featured_image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                  )}
                  <div className="p-6">
                    {relatedPost.category && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-2">
                        {relatedPost.category.name}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
