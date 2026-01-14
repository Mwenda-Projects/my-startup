import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using HustleSphere, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                HustleSphere is a campus marketplace platform that connects students for buying, selling, and offering services. We provide the technology and platform but are not a party to any transaction between users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features of HustleSphere, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not create multiple accounts for deceptive purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Sell prohibited items including weapons, drugs, or counterfeit goods</li>
                <li>Use the platform for illegal activities</li>
                <li>Spam or send unsolicited messages</li>
                <li>Attempt to circumvent platform security measures</li>
                <li>Collect user information without consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Listings and Transactions</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When creating listings:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must accurately describe items and services</li>
                <li>You are responsible for fulfilling transactions</li>
                <li>Prices and terms must be honored as listed</li>
                <li>You must have legal rights to sell or offer items/services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                HustleSphere is not responsible for the quality, safety, or legality of items or services listed on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The HustleSphere platform, including its logo, design, and content, is protected by intellectual property laws. You may not copy, modify, or distribute our content without permission. By posting content, you grant us a license to use it for platform operations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                HustleSphere is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, accuracy of listings, or successful transactions. Users transact at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, HustleSphere shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or transactions with other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account for violations of these terms or for any other reason at our discretion. You may also close your account at any time through your profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these terms from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: legal@hustlesphere.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
