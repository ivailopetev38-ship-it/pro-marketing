import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { SpotlightCursor } from "@/components/effects/SpotlightCursor";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { BookingConfetti } from "@/components/effects/BookingConfetti";
import { Toaster } from "@/components/ui/sonner";

// Below-the-fold sections — dynamically imported so the initial bundle stays
// small. Each section streams in as the user scrolls.
const Services = dynamic(() => import("@/components/landing/Services").then((m) => ({ default: m.Services })));
const LiveDashboards = dynamic(() => import("@/components/landing/LiveDashboards").then((m) => ({ default: m.LiveDashboards })));
const CRMShowcase = dynamic(() => import("@/components/landing/CRMShowcase").then((m) => ({ default: m.CRMShowcase })));
const PainPoints = dynamic(() => import("@/components/landing/PainPoints").then((m) => ({ default: m.PainPoints })));
const Industries = dynamic(() => import("@/components/landing/Industries").then((m) => ({ default: m.Industries })));
const Testimonials = dynamic(() => import("@/components/landing/Testimonials").then((m) => ({ default: m.Testimonials })));
const WhyUs = dynamic(() => import("@/components/landing/WhyUs").then((m) => ({ default: m.WhyUs })));
const Expert = dynamic(() => import("@/components/landing/Expert").then((m) => ({ default: m.Expert })));
const FAQ = dynamic(() => import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })));
const QuickLeadForm = dynamic(() => import("@/components/landing/QuickLeadForm").then((m) => ({ default: m.QuickLeadForm })));
const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA").then((m) => ({ default: m.FinalCTA })));
const Footer = dynamic(() => import("@/components/landing/Footer").then((m) => ({ default: m.Footer })));
const StickyMobileCTA = dynamic(() => import("@/components/landing/StickyMobileCTA").then((m) => ({ default: m.StickyMobileCTA })));
const ChatWidget = dynamic(() => import("@/components/chatbot/ChatWidget").then((m) => ({ default: m.ChatWidget })));

export default function HomePage() {
  return (
    <>
      <SpotlightCursor />
      <ScrollProgress />
      <BookingConfetti />
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <LiveDashboards />
        <CRMShowcase />
        <PainPoints />
        <Industries />
        <Testimonials />
        <WhyUs />
        <Expert />
        <FAQ />
        <QuickLeadForm />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
      <ChatWidget />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
