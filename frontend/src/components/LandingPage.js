import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="font-display bg-background-dark text-slate-200 antialiased dark min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-icons text-white text-xl">chat</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Yeab Chat
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="#"
              >
                Pricing
              </a>
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="#"
              >
                About
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/login?mode=register"
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              Version 2.0 Now Live
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
              Connect Seamlessly with{" "}
              <span className="text-primary">Yeab Chat</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
              Experience lightning-fast communication with end-to-end security.
              Built for teams who value privacy, speed, and beautiful design.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login?mode=register"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
              >
                Get Started for Free
                <span className="material-icons">arrow_forward</span>
              </Link>
              <button className="w-full sm:w-auto bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                View Demo
              </button>
            </div>
          </div>
          {/* Product Preview */}
          <div className="mt-20 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-surface-dark border border-border-dark rounded-2xl shadow-2xl overflow-hidden aspect-[16/9] lg:aspect-[21/9]">
              {/* Mock Chat UI */}
              <div className="flex h-full">
                <div className="w-64 bg-background-dark/50 border-r border-border-dark hidden md:flex flex-col p-4 gap-4">
                  <div className="h-8 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                  <div className="space-y-3 mt-4">
                    <div className="h-10 w-full bg-primary/20 rounded-lg flex items-center px-3 border border-primary/30">
                      <div className="w-6 h-6 rounded-full bg-primary mr-2"></div>
                      <div className="h-3 w-20 bg-primary/40 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-slate-800/50 rounded-lg flex items-center px-3">
                      <div className="w-6 h-6 rounded-full bg-slate-700 mr-2"></div>
                      <div className="h-3 w-24 bg-slate-700/50 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-slate-800/50 rounded-lg flex items-center px-3">
                      <div className="w-6 h-6 rounded-full bg-slate-700 mr-2"></div>
                      <div className="h-3 w-16 bg-slate-700/50 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col relative">
                  <div className="h-16 border-b border-border-dark flex items-center px-6 justify-between bg-background-dark/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400"></div>
                      <span className="font-semibold text-white">
                        Product Development
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="material-icons text-slate-500">
                        videocam
                      </span>
                      <span className="material-icons text-slate-500">
                        phone
                      </span>
                      <span className="material-icons text-slate-500">
                        more_vert
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 space-y-6 overflow-hidden">
                    <div className="flex gap-3 max-w-lg">
                      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
                      <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                        <p className="text-sm text-slate-300">
                          Hey team, have we finalized the new security protocols
                          for the file sharing module?
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 max-w-lg ml-auto flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-primary shrink-0"></div>
                      <div className="bg-primary p-4 rounded-2xl rounded-tr-none">
                        <p className="text-sm text-white">
                          Yes, end-to-end encryption is fully implemented. Ready
                          for staging!
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 max-w-lg">
                      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
                      <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                        <p className="text-sm text-slate-300">
                          Great. I'll start the final testing phase now. 🚀
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border-dark bg-background-dark/30">
                    <div className="flex items-center bg-slate-900 border border-border-dark rounded-xl px-4 py-3 gap-3">
                      <span className="material-icons text-slate-500">
                        add_circle
                      </span>
                      <div className="flex-1 text-slate-500 text-sm italic">
                        Type your message here...
                      </div>
                      <span className="material-icons text-primary">send</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Features Section */}
      <section
        className="py-24 bg-slate-50 dark:bg-background-dark/50"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to stay connected
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Yeab Chat combines advanced security with lightning-fast speeds to
              provide the ultimate communication platform for professionals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary dark:hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons text-primary text-3xl">
                  bolt
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Real-time Messaging
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our low-latency infrastructure ensures your messages are
                delivered instantly, no matter where your team is in the world.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary dark:hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons text-primary text-3xl">
                  cloud_upload
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Secure File Sharing
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Drag and drop any file type. Our system optimizes and secures
                your data transfers with advanced cloud technology.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-border-dark hover:border-primary dark:hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-icons text-primary text-3xl">
                  lock
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                End-to-End Encryption
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your privacy is our priority. Every chat and file is protected
                with military-grade encryption from start to finish.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Visual CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Decorative Circle */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="max-w-xl text-center lg:text-left relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Join Yeab Chat Today
              </h2>
              <p className="text-blue-100 text-lg mb-8 opacity-90">
                Ready to transform how your team communicates? Join thousands of
                professionals using Yeab Chat every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login?mode=register"
                  className="bg-white text-primary hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/10 transition-all text-center"
                >
                  Create Free Account
                </Link>
                <button className="bg-primary/50 border border-white/30 text-white hover:bg-primary/60 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                  Talk to Sales
                </button>
              </div>
            </div>
            <div className="relative w-full lg:w-1/3 aspect-square max-w-[300px] z-10">
              <div className="w-full h-full bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <span className="material-icons text-white text-[120px] opacity-80">
                  diversity_2
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-border-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <span className="material-icons text-white text-sm">
                    chat
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Yeab Chat
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-xs mb-6 text-sm">
                Building the future of team communication with privacy and
                performance at its core.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-dark flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                  href="#"
                >
                  <span className="material-icons text-xl">facebook</span>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-dark flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                  href="#"
                >
                  <span className="material-icons text-xl">language</span>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-dark flex items-center justify-center text-slate-500 hover:text-primary transition-colors"
                  href="#"
                >
                  <span className="material-icons text-xl">email</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">
                Product
              </h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Security
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Integrations
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">
                Company
              </h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Blog
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6">
                Legal
              </h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-border-dark flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2024 Yeab Chat Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
