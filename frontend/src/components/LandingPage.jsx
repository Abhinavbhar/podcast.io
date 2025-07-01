import React, { useState, useEffect } from 'react';
import { Mic, Users, Download, Zap, Star, Play, Pause, Volume2, Headphones, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [user, setUser] = useState(null);
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tech Podcast Host",
      content: "The audio quality is incredible. Our remote interviews sound like we're in the same studio.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Business Podcaster",
      content: "Finally, a platform that makes recording with guests seamless. No more technical headaches!",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "True Crime Podcaster", 
      content: "The automatic backup saved our 2-hour episode when my internet cut out. Absolute lifesaver!",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Studio-Quality Recording",
      description: "Record in up to 48kHz/24-bit quality with automatic noise reduction and echo cancellation."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Guest Support",
      description: "Host up to 8 participants simultaneously with individual track recording for perfect editing."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Automatic Backup",
      description: "Your recordings are continuously backed up to the cloud. Never lose content again."
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Instant Download",
      description: "Get your high-quality audio files immediately after recording in multiple formats."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "One-Click Setup",
      description: "No downloads or installations. Start recording professional podcasts in seconds."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Unlimited Recording",
      description: "Record for as long as you need. No time limits on your creative process."
    }
  ];

  useEffect(() => {
     const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PodcastPro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
  <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
  <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
  <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
  <a href="preview" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
    Start Recording
  </a>
  {user ? (
    <span className="text-white font-semibold ml-4">Hi, {user.username}</span>
  ) : (
    <>
      <a href="/login" className="text-gray-300 hover:text-white transition-colors">Login</a>
      <a href="/signup" className="text-gray-300 hover:text-white transition-colors">Signup</a>
    </>
  )}
</div>

          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Trusted by 50,000+ podcasters worldwide</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Record Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Podcast</span>
              <br />Like a Pro
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Create studio-quality podcasts from anywhere. Record with guests remotely, 
              get crystal-clear audio, and download instantly. No software required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl">
                Start Recording Free
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2 text-white border border-white/30 px-6 py-4 rounded-full hover:bg-white/10 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Audio Visualizer Mock */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Recording Session</div>
                    <div className="text-gray-400 text-sm">2 participants • HD Quality</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">REC</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 h-16">
                {[...Array(50)].map((_, i) => (
                  <div 
                    key={i}
                    className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse"
                    style={{ 
                      width: '3px', 
                      height: `${Math.random() * 100 + 20}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to Create
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Amazing Podcasts</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional-grade features that make remote podcast recording feel like magic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Podcasters</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
              <div className="flex items-center justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-2xl md:text-3xl text-white text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                <div className="text-gray-400">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-white/30'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Next Episode?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of podcasters who trust PodcastPro for their recording needs. 
              Start your free session today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl">
                Start Recording Free
              </button>
              <button className="text-white border border-white/30 px-8 py-4 rounded-full hover:bg-white/10 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">PodcastPro</span>
              </div>
              <p className="text-gray-400">
                Professional podcast recording made simple. Create, connect, and share your voice with the world.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PodcastPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}