import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Lock } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                HustleSphere ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our campus marketplace platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Account information: name, email, password</li>
                <li>Profile information: university, major, graduation year, bio, profile photo</li>
                <li>Listing information: item descriptions, photos, prices</li>
                <li>Communications: messages between users, support requests</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Device information: browser type, operating system</li>
                <li>Usage data: pages visited, features used, time spent</li>
                <li>Log data: IP address, access times, referring URLs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and maintain our platform</li>
                <li>Create and manage your account</li>
                <li>Process and display your listings</li>
                <li>Facilitate communication between users</li>
                <li>Send important updates and notifications</li>
                <li>Improve our services and user experience</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Other users: Your public profile and listings are visible to other users</li>
                <li>Service providers: Companies that help us operate the platform</li>
                <li>Legal authorities: When required by law or to protect rights</li>
                <li>Business transfers: In case of merger, acquisition, or sale</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Restrict processing of your data</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@hustlesphere.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we will delete your personal information within 30 days, except where required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                HustleSphere is not intended for users under 16 years of age. We do not knowingly collect information from children under 16. If we discover such information, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or platform notification. Your continued use of HustleSphere after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy or our practices, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@hustlesphere.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
