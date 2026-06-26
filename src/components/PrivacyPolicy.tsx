import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-card rounded-3xl card-3d my-10">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="font-display text-3xl">Privacy Policy</h1>
      </div>
      
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
        <p>
          Welcome to Vibe Plan Space. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy explains how we handle your data when you use our application.
        </p>

        <h2 className="text-xl font-bold text-foreground">2. Data We Collect</h2>
        <p>
          Our application integrates with Google Calendar and Google Classroom to help you manage your tasks. 
          When you connect your Google account, we request access to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Google Calendar:</strong> To read your upcoming events and schedule new tasks.</li>
          <li><strong>Google Classroom:</strong> To read your coursework and assignments so they can be imported into your task matrix.</li>
        </ul>

        <h2 className="text-xl font-bold text-foreground">3. How We Use Your Data</h2>
        <p>
          We use your data strictly to provide the core functionality of Vibe Plan Space. 
          Your calendar events and classroom assignments are fetched directly from Google's servers to your browser. 
          <strong> We do not store your private Google data on any external servers.</strong> All task processing happens locally on your device or is temporarily kept in your browser's local storage.
        </p>

        <h2 className="text-xl font-bold text-foreground">4. Data Sharing and Disclosure</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. Your Google data is never shared with anyone and is only visible to you within the application interface.
        </p>

        <h2 className="text-xl font-bold text-foreground">5. Security</h2>
        <p>
          We use industry-standard security measures, including Google's official secure OAuth 2.0 authentication flow, to ensure your account remains safe. We never see or store your Google password.
        </p>

        <h2 className="text-xl font-bold text-foreground">6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact the developer at: <strong>avneetarora1106@gmail.com</strong>
        </p>
      </div>
    </div>
  );
}
