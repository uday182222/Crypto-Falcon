import React from 'react';
import { BookOpen, Calendar, User, ArrowRight, Tag, Clock, TrendingUp, Lightbulb, Shield, Coins, Users, Globe, Zap, Mail } from 'lucide-react';

const Blog = () => {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with Crypto Trading: A Beginner's Guide",
      excerpt: "Learn the fundamentals of cryptocurrency trading, from understanding blockchain technology to making your first virtual trade on our simulation platform.",
      author: "BitcoinPro Team",
      date: "January 15, 2025",
      readTime: "8 min read",
      category: "Beginner Guide",
      tags: ["crypto", "trading", "beginner"],
      featured: true,
      icon: BookOpen
    },
    {
      id: 2,
      title: "Understanding Market Volatility: Why Crypto Prices Fluctuate",
      excerpt: "Explore the factors that drive cryptocurrency price movements and how to navigate market volatility in your trading strategy.",
      author: "Market Analysts",
      date: "January 12, 2025",
      readTime: "12 min read",
      category: "Market Analysis",
      tags: ["volatility", "analysis", "strategy"],
      featured: false,
      icon: TrendingUp
    },
    {
      id: 3,
      title: "Risk Management Strategies for Crypto Traders",
      excerpt: "Discover essential risk management techniques that every crypto trader should know to protect their virtual portfolio.",
      author: "Risk Management Expert",
      date: "January 10, 2025",
      readTime: "10 min read",
      category: "Risk Management",
      tags: ["risk", "management", "portfolio"],
      featured: false,
      icon: Shield
    },
    {
      id: 4,
      title: "The Future of Cryptocurrency: Trends to Watch in 2025",
      excerpt: "Explore emerging trends and technologies that are shaping the future of cryptocurrency and digital assets.",
      author: "Crypto Researcher",
      date: "January 8, 2025",
      readTime: "15 min read",
      category: "Future Trends",
      tags: ["trends", "future", "technology"],
      featured: false,
      icon: Zap
    },
    {
      id: 5,
      title: "Building a Diversified Crypto Portfolio",
      excerpt: "Learn how to create a well-balanced cryptocurrency portfolio that spreads risk across different digital assets.",
      author: "Portfolio Strategist",
      date: "January 5, 2025",
      readTime: "11 min read",
      category: "Portfolio Strategy",
      tags: ["portfolio", "diversification", "strategy"],
      featured: false,
      icon: Coins
    },
    {
      id: 6,
      title: "Community Trading: Learning from Other Traders",
      excerpt: "Discover the benefits of community-driven trading and how to learn from the experiences of fellow traders.",
      author: "Community Manager",
      date: "January 3, 2025",
      readTime: "7 min read",
      category: "Community",
      tags: ["community", "learning", "collaboration"],
      featured: false,
      icon: Users
    }
  ];

  const categories = [
    { name: "All Posts", count: blogPosts.length, active: true },
    { name: "Beginner Guide", count: 1, active: false },
    { name: "Market Analysis", count: 1, active: false },
    { name: "Risk Management", count: 1, active: false },
    { name: "Future Trends", count: 1, active: false },
    { name: "Portfolio Strategy", count: 1, active: false },
    { name: "Community", count: 1, active: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-500/20 rounded-full border border-green-400/30">
              <BookOpen className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-green-500 mb-6">
            BitcoinPro Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Stay updated with the latest insights, strategies, and educational content about cryptocurrency trading and market analysis.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{blogPosts.length} Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Expert Contributors</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Latest Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-16 max-w-6xl">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Tag className="w-6 h-6 text-blue-400" />
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                    category.active
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-700/30 border-slate-600/50 text-gray-300 hover:border-blue-500/50 hover:text-blue-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          {blogPosts.filter(post => post.featured).map(post => (
            <div key={post.id} className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl p-8 shadow-2xl border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <post.icon className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-green-300 font-semibold">Featured Post</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{post.title}</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{post.category}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-gray-300 border border-slate-600/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 group">
                Read Full Article
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.filter(post => !post.featured).map(post => (
            <article
              key={post.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <post.icon className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-green-300 text-sm font-medium">{post.category}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-gray-300 border border-slate-600/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <button className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group">
                Read More
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 shadow-2xl border border-blue-500/30">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Get the latest crypto trading insights, market analysis, and educational content delivered directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                  Subscribe
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
