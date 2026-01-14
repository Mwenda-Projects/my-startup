import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatbot from "@/components/chat/AIChatbot";
import { Search, HelpCircle, ShoppingBag, Briefcase, User, CreditCard, Shield, MessageCircle } from "lucide-react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const categories = [
    {
      icon: User,
      title: "Account & Profile",
      description: "Manage your account settings",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Get Started' button on the homepage or navigate to the Sign Up page. Enter your email, create a password, and fill in your details. You'll receive a verification email to confirm your account."
        },
        {
          question: "How do I reset my password?",
          answer: "On the Sign In page, click 'Forgot Password'. Enter your email address and we'll send you a link to reset your password. The link expires after 24 hours."
        },
        {
          question: "How do I update my profile photo?",
          answer: "Go to your Profile Settings page, click on your avatar image, and upload a new photo. Supported formats include JPG, PNG, and GIF up to 5MB."
        },
        {
          question: "Can I change my email address?",
          answer: "Currently, you cannot change your email address directly. Please contact support if you need to update your email."
        }
      ]
    },
    {
      icon: Briefcase,
      title: "Services",
      description: "Offering and finding services",
      faqs: [
        {
          question: "How do I post a service?",
          answer: "Navigate to your Dashboard and click 'Add Service'. Fill in the service title, description, category, and pricing. Upload images to showcase your work, then publish your listing."
        },
        {
          question: "How does pricing work?",
          answer: "You can set either a fixed price or a starting price. Fixed prices are for set deliverables, while starting prices indicate rates may vary based on project scope."
        },
        {
          question: "Can I edit my service after posting?",
          answer: "Yes, go to your Dashboard, find the service you want to edit, and click the edit button. You can update all details including price, description, and images."
        },
        {
          question: "How do I contact a service provider?",
          answer: "Click on any service listing to view details. You'll find contact options to reach out directly to the provider through the platform."
        }
      ]
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description: "Buying and selling items",
      faqs: [
        {
          question: "How do I list an item for sale?",
          answer: "Go to your Dashboard and click 'Add Item'. Enter the item details including title, description, condition, and price. Add photos and publish your listing."
        },
        {
          question: "What items can I sell?",
          answer: "You can sell textbooks, electronics, furniture, clothing, and other student-friendly items. Prohibited items include weapons, illegal substances, and counterfeit goods."
        },
        {
          question: "How do I mark an item as sold?",
          answer: "In your Dashboard, find the item and toggle it to inactive, or delete the listing entirely once the sale is complete."
        },
        {
          question: "Is there a listing fee?",
          answer: "No, listing items on HustleSphere is completely free. We believe in helping students connect without barriers."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Payment methods and transactions",
      faqs: [
        {
          question: "How do payments work?",
          answer: "HustleSphere connects buyers and sellers. Payment arrangements are made directly between parties. We recommend using secure payment methods and meeting in safe locations."
        },
        {
          question: "Does HustleSphere take a commission?",
          answer: "Currently, HustleSphere does not charge any commission on transactions. All payments are handled directly between users."
        },
        {
          question: "What payment methods are recommended?",
          answer: "We recommend using mobile money, bank transfers, or cash for in-person transactions. Always verify payment before handing over items or completing services."
        }
      ]
    },
    {
      icon: Shield,
      title: "Safety & Security",
      description: "Staying safe on the platform",
      faqs: [
        {
          question: "How do I report a suspicious user?",
          answer: "Click on the user's profile and use the 'Report' option. Provide details about the issue and our team will investigate within 24-48 hours."
        },
        {
          question: "Tips for safe transactions",
          answer: "Meet in public places, bring a friend, verify items before payment, use tracked payment methods, and trust your instincts. If something feels off, walk away."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use industry-standard encryption to protect your data. We never share your personal information with third parties without consent."
        }
      ]
    },
    {
      icon: MessageCircle,
      title: "Support",
      description: "Getting help when you need it",
      faqs: [
        {
          question: "How do I contact support?",
          answer: "Use the OfliX AI chatbot for instant help, or email us at mwenda.hq@gmail.com. We typically respond within 24 hours."
        },
        {
          question: "What are the support hours?",
          answer: "Our AI assistant is available 24/7. Human support is available Monday to Friday, 9 AM to 6 PM EAT."
        },
        {
          question: "How do I give feedback?",
          answer: "We love hearing from you! Use the feedback form in your account settings or email us directly with suggestions."
        }
      ]
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0 || searchQuery === "");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Find answers to common questions or reach out to our support team
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`item-${faqIndex}`}>
                      <AccordionTrigger className="text-left text-sm">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Still need help?</CardTitle>
            <CardDescription>
              Our support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="text-center p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Chat with OfliX AI</p>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </button>
            <a 
              href="mailto:mwenda.hq@gmail.com"
              className="text-center p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
            >
              <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Email Support</p>
              <p className="text-sm text-muted-foreground">mwenda.hq@gmail.com</p>
            </a>
          </CardContent>
        </Card>
      </main>

      <Footer />
      <AIChatbot isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
};

import { Mail } from "lucide-react";

export default HelpCenter;
