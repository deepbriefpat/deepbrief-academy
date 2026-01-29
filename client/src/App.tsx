import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import AssessmentResults from "./pages/AssessmentResults";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import Community from "./pages/Community";
import WhoAreYouThinkingWith from "./pages/WhoAreYouThinkingWith";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import ClarityProgram from "./pages/ClarityProgram";
import ClarityBooking from "./pages/ClarityBooking";
import BookCall from "./pages/BookCall";
import BookCallConfirmation from "./pages/BookCallConfirmation";
import About from "./pages/About";
import NetworkAssessmentResults from "./pages/NetworkAssessmentResults";
import CalmProtocol from "./pages/CalmProtocol";
import { AdminDashboard } from "./pages/AdminDashboard";
import AdminResources from "./pages/AdminResources";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminEmailAnalytics from "./pages/AdminEmailAnalytics";
import AdminOnboardingAnalytics from "./pages/AdminOnboardingAnalytics";
import { AdminPressureProfiles } from "./pages/AdminPressureProfiles";
import { AdminAICoach } from "./pages/AdminAICoach";
import { AdminUsers } from "./pages/AdminUsers";
import AdminCommitments from "./pages/AdminCommitments";
import { AdminGuestPasses } from "./pages/AdminGuestPasses";
import { Settings } from "./pages/Settings";
import Unsubscribe from "./pages/Unsubscribe";
import EmailPreferences from "./pages/EmailPreferences";
import LeadershipPressureProfile from "./pages/LeadershipPressureProfile";
import AICoachLanding from "./pages/AICoachLanding";
import AICoachWelcome from "./pages/AICoachWelcome";
import AICoachDemo from "./pages/AICoachDemo";
import AICoachOnboarding from "./pages/AICoachOnboarding";
import AICoachDashboard from "./pages/AICoachDashboard";
import GuestPassManagement from "./pages/GuestPassManagement";
import AICoachGuest from "./pages/AICoachGuest";
import AICoachTemplates from "./pages/AICoachTemplates";
import AICoachResume from "./pages/AICoachResume";
import AICoachSubscribe from "./pages/AICoachSubscribe";
import Profile from "./pages/Profile";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionSettings from "./pages/SubscriptionSettings";
import ManageSubscription from "./pages/ManageSubscription";
import ProgressDashboard from "./pages/ProgressDashboard";
import SessionHistory from "./pages/SessionHistory";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HowToUseThis from "./pages/HowToUseThis";
import CoachSelectionGuide from "./pages/CoachSelectionGuide";
import { TestEmail } from "./pages/TestEmail";
import AuthCallback from "./pages/AuthCallback";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/auth/callback"} component={AuthCallback} />
        <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/test-email"} component={TestEmail} />
      <Route path={"/profile"} component={Profile} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path={"/assessment"} component={Assessment} />
      <Route path={"/leadership-pressure-profile"} component={LeadershipPressureProfile} />
      <Route path={"/assessment/results"} component={AssessmentResults} />
      <Route path={"/resources"} component={Resources} />
      <Route path={"/resources/:slug"} component={ResourceDetail} />
      <Route path={"/stories"} component={Stories} />
      <Route path={"/stories/:slug"} component={StoryDetail} />
      <Route path={"/community"} component={Community} />
      <Route path={"/reflection"} component={WhoAreYouThinkingWith} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/clarity-under-pressure"} component={ClarityProgram} />
      <Route path={"/clarity-under-pressure/book-call"} component={ClarityBooking} />
      <Route path={"/book-call"} component={BookCall} />
      <Route path={"/book-call/confirmation"} component={BookCallConfirmation} />
      <Route path={"/unsubscribe"} component={Unsubscribe} />
      <Route path={"/email-preferences"} component={EmailPreferences} />
      <Route path={"/who-are-you-thinking-with"} component={WhoAreYouThinkingWith} />
      <Route path={"/network-assessment/results"} component={NetworkAssessmentResults} />
      <Route path={"/calm-protocol"} component={CalmProtocol} />
        {/* AI Coach Routes */}
        <Route path="/ai-coach" component={AICoachLanding} />
        <Route path="/ai-coach/welcome" component={AICoachWelcome} />
        <Route path="/ai-coach/demo" component={AICoachDemo} />
        <Route path="/ai-coach/onboarding" component={AICoachOnboarding} />
        <Route path="/ai-coach/dashboard" component={AICoachDashboard} />
        <Route path="/ai-coach/guest" component={AICoachGuest} />
        <Route path="/ai-coach/resume" component={AICoachResume} />
        <Route path="/ai-coach/subscribe" component={AICoachSubscribe} />
        <Route path="/ai-coach/templates" component={AICoachTemplates} />
        <Route path="/ai-coach/history" component={SessionHistory} />
        <Route path="/how-to-use-this" component={HowToUseThis} />
        <Route path="/coach-selection-guide" component={CoachSelectionGuide} />
        <Route path="/subscription-settings" component={SubscriptionSettings} />
          <Route path="/manage-subscription" component={ManageSubscription} />
          <Route path="/ai-coach/progress" component={ProgressDashboard} />
        <Route path="/settings" component={Settings} />
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/resources" component={AdminResources} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/email-analytics" component={AdminEmailAnalytics} />
        <Route path="/admin/onboarding-analytics" component={AdminOnboardingAnalytics} />
        <Route path="/admin/pressure-profiles" component={AdminPressureProfiles} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/guest-passes" component={AdminGuestPasses} />
        <Route path="/admin/ai-coach" component={AdminAICoach} />
        <Route path="/admin/commitments" component={AdminCommitments} />
      <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
