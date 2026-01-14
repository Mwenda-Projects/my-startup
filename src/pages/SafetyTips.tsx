import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, MapPin, Users, Eye, CreditCard, AlertTriangle, Phone, CheckCircle } from "lucide-react";

const SafetyTips = () => {
  const safetyCategories = [
    {
      icon: MapPin,
      title: "Meeting in Person",
      color: "text-blue-500",
      tips: [
        "Always meet in public, well-lit places like campus cafeterias, libraries, or popular cafes",
        "Avoid meeting at your home or the other person's home for first-time transactions",
        "Choose locations with security cameras when possible",
        "Meet during daylight hours whenever possible",
        "Let a friend or family member know where you're going and who you're meeting"
      ]
    },
    {
      icon: Users,
      title: "Personal Safety",
      color: "text-green-500",
      tips: [
        "Bring a friend or roommate with you to meetings, especially for larger transactions",
        "Trust your instincts - if something feels wrong, leave immediately",
        "Keep your phone charged and easily accessible",
        "Share your live location with a trusted friend during meetups",
        "Have an exit strategy planned before you arrive"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment Safety",
      color: "text-purple-500",
      tips: [
        "Never pay for items before seeing them in person",
        "Use secure payment methods like mobile money with transaction records",
        "Avoid wire transfers or cryptocurrency for transactions",
        "Get a receipt or confirmation for all payments",
        "Be wary of anyone asking for payment before meeting"
      ]
    },
    {
      icon: Eye,
      title: "Verification Tips",
      color: "text-orange-500",
      tips: [
        "Verify the condition of items before completing payment",
        "Check that electronics work properly before purchasing",
        "Ask for proof of ownership for high-value items",
        "Request student ID verification for large transactions",
        "Take photos of items and any serial numbers"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Red Flags to Watch",
      color: "text-red-500",
      tips: [
        "Prices that seem too good to be true",
        "Pressure to complete transactions quickly",
        "Requests to move communication off-platform",
        "Sellers who refuse to meet in person",
        "Vague or inconsistent item descriptions",
        "Requests for personal financial information"
      ]
    },
    {
      icon: Phone,
      title: "Communication Safety",
      color: "text-teal-500",
      tips: [
        "Keep initial conversations within the HustleSphere platform",
        "Don't share personal details like your home address or class schedule",
        "Be cautious about sharing your phone number until you've verified the person",
        "Save all communication as evidence in case of disputes",
        "Report suspicious messages or behavior immediately"
      ]
    }
  ];

  const emergencyContacts = [
    { name: "Campus Security", number: "Your campus security line" },
    { name: "Local Police", number: "999 or your local emergency number" },
    { name: "HustleSphere Support", number: "mwenda.hq@gmail.com" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Safety Tips</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your safety is our priority. Follow these guidelines to have secure transactions on HustleSphere.
          </p>
        </div>

        {/* Safety Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {safetyCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Safety Checklist */}
        <Card className="mb-12 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Quick Safety Checklist
            </CardTitle>
            <CardDescription>
              Before every transaction, make sure you can check all these boxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Meeting in a public place",
                "Someone knows where I'm going",
                "My phone is charged",
                "I've verified the item/service details",
                "Payment method is secure and traceable",
                "I have an exit plan if needed"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-5 h-5 border-2 border-primary rounded" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>
              Save these numbers in case you need help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-muted-foreground">{contact.number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SafetyTips;
