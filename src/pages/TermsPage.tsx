import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SaveMyName" className="w-8 h-8" />
            <span className="font-semibold">SaveMyName</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using SaveMyName ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              SaveMyName is a business card scanning application that uses AI technology to extract contact information from business cards and organize them in Google Sheets. The Service is provided "as is" and "as available."
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>You must sign in using a valid Google account to use the Service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to notify us immediately of any unauthorized use</li>
              <li>You must be at least 13 years old to use the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload content that infringes on others' rights</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
            <h3 className="text-xl font-medium mb-3">5.1 Free Tier</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Free users receive a limited number of scans per month. Features may be limited compared to paid plans.
            </p>

            <h3 className="text-xl font-medium mb-3">5.2 Premium Plans</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Subscription fees are billed in advance on a monthly basis</li>
              <li>Payments are processed through Razorpay</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its original content, features, and functionality, is owned by SaveMyName and is protected by international copyright, trademark, and other intellectual property laws. You retain ownership of any content you upload.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, SaveMyName shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service. Our total liability shall not exceed the amount you paid for the Service in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" without warranties of any kind. We do not guarantee that the AI extraction will be 100% accurate. Users are responsible for verifying extracted information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about these Terms, please contact us at:
            </p>
            <p className="text-primary mt-2">support@savemyname.in</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaveMyName. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
