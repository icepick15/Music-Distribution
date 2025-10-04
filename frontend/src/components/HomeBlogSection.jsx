import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ArrowRightIcon, 
  ClockIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const HomeBlogSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      // Fetch featured posts
      const featuredResponse = await fetch('http://localhost:8000/api/blog/posts/featured/');
      const featuredData = await featuredResponse.json();
      
      // Fetch recent posts
      const recentResponse = await fetch('http://localhost:8000/api/blog/posts/?ordering=-published_at&limit=3');
      const recentData = await recentResponse.json();
      
      setFeaturedPosts(featuredData.slice(0, 1)); // Get main featured post
      setRecentPosts(recentData.results || recentData.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const mainPost = featuredPosts[0] || recentPosts[0];
  const sidebarPosts = recentPosts.slice(0, 3);

  if (!mainPost) return null;

  return (
    <section className="relative py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
            <BookOpenIcon className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-semibold text-purple-900">Knowledge Hub</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Learn & Grow Your{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Music Career
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert guides, industry insights, and success stories to help you navigate the music distribution landscape
          </p>
        </div>

        {/* Blog Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Main Featured Post - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Link
              to={`/blog/${mainPost.slug}`}
              className="group block relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full"
            >
              {/* Featured Image */}
              {mainPost.featured_image ? (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={mainPost.featured_image}
                    alt={mainPost.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Featured Badge */}
                  {mainPost.featured && (
                    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full shadow-lg">
                      <SparklesIcon className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold text-sm">Featured</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  {mainPost.category && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-purple-700 font-semibold text-sm">
                        {mainPost.category.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 md:h-80 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpenIcon className="w-24 h-24 text-white/50" />
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition line-clamp-2">
                  {mainPost.title}
                </h3>
                
                <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                  {mainPost.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {mainPost.reading_time}
                  </div>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{new Date(mainPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  
                  {/* Tags */}
                  {mainPost.tags && mainPost.tags.length > 0 && (
                    <>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <div className="flex gap-2">
                        {mainPost.tags.slice(0, 2).map((tag) => (
                          <span key={tag.id} className="text-purple-600 font-medium">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Read More Button */}
                <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:text-purple-700 transition">
                  <span>Read Full Article</span>
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Sidebar - Recent Posts - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <FireIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">Latest Articles</h3>
            </div>

            {sidebarPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  {post.featured_image ? (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <BookOpenIcon className="w-8 h-8 text-white" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {post.category && (
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded mb-2">
                        {post.category.name}
                      </span>
                    )}
                    
                    <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition">
                      {post.title}
                    </h4>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span>{post.reading_time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Blog Button */}
        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <BookOpenIcon className="w-5 h-5 mr-2" />
            <span>Explore All Articles</span>
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          
          <p className="mt-4 text-gray-600">
            Over {recentPosts.length}+ articles to help you succeed
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogSection;
