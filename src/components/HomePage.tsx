import React from 'react';
import { Brain, Upload, Sparkles, MessageCircle, Edit3, FileText, ArrowRight, CheckCircle, Zap, Shield, Globe } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {
  const features = [
    {
      icon: Brain,
      title: "GPT-4 Powered Analysis",
      description: "Advanced AI analyzes your PDFs and provides intelligent insights"
    },
    {
      icon: MessageCircle,
      title: "Smart Q&A",
      description: "Ask any questions about your document and get accurate answers"
    },
    {
      icon: Edit3,
      title: "PDF Text Editing",
      description: "Modify text content and download updated versions"
    },
    {
      icon: FileText,
      title: "Multi-format Support",
      description: "Works with invoices, reports, resumes, and any PDF document"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload your PDF",
      description: "Simply drag and drop or select any PDF file from your device",
      icon: Upload
    },
    {
      number: "02", 
      title: "AI analyzes your file",
      description: "GPT-4 processes the content and creates a smart summary",
      icon: Sparkles
    },
    {
      number: "03",
      title: "View smart summary and ask questions",
      description: "Get insights, ask questions, and edit your document",
      icon: MessageCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligent PDF Assistant
                </h1>
                <p className="text-sm text-gray-600">Powered by GPT-4 for smart document analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your PDFs with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                AI Intelligence
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload any PDF and let GPT-4 analyze, summarize, and answer questions about your documents. 
              Extract financial data, edit content, and get intelligent insights instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 space-x-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Zap className="h-5 w-5" />
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>No signup required • Process any PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to unlock the power of AI-driven PDF analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-3 mr-4">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-bold text-gray-300">{step.number}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to work smarter with your PDF documents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-3 w-fit mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose Our PDF Assistant?</h3>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Built for professionals who need intelligent document processing
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Accurate Analysis",
                description: "GPT-4 powered analysis ensures high accuracy in content understanding and data extraction"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Process documents in seconds, not minutes. Get instant insights and summaries"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your documents are processed securely and never stored permanently on our servers"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 rounded-full p-4 w-fit mx-auto mb-4">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-3">{benefit.title}</h4>
                <p className="text-blue-100 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your PDF Workflow?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of professionals who trust our AI-powered PDF assistant
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 space-x-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Brain className="h-5 w-5" />
            <span>Start Analyzing PDFs</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Intelligent PDF Assistant</span>
          </div>
          <p className="text-center text-gray-400">
            Powered by GPT-4 • Built for professionals • Secure & Private
          </p>
        </div>
      </footer>
    </div>
  );
}