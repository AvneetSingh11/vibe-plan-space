import React from "react";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-card rounded-3xl card-3d my-10">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-primary" />
        <h1 className="font-display text-3xl">Terms of Service</h1>
      </div>
      
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Vibe Plan Space, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 className="text-xl font-bold text-foreground">2. Description of Service</h2>
        <p>
          Vibe Plan Space is a productivity and task management tool that integrates with your personal Google Calendar and Google Classroom accounts. The service is provided "as is" and is designed to help you organize your daily tasks.
        </p>

        <h2 className="text-xl font-bold text-foreground">3. User Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your Google account. You agree that Vibe Plan Space is not liable for any loss or damage arising from your failure to protect your account credentials.
        </p>

        <h2 className="text-xl font-bold text-foreground">4. Modifications to Service</h2>
        <p>
          We reserve the right at any time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
        </p>

        <h2 className="text-xl font-bold text-foreground">5. Disclaimer of Warranties</h2>
        <p>
          Your use of the service is at your sole risk. The service is provided on an "as is" and "as available" basis. We expressly disclaim all warranties of any kind, whether express or implied.
        </p>

        <h2 className="text-xl font-bold text-foreground">6. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact the developer at: <strong>avneetarora1106@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}
