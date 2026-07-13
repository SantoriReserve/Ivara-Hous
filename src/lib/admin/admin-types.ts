import type { AssessmentRecord } from "@/lib/assessment-schema";
import type { EmailDeliveryRecord } from "@/lib/email/email-delivery-repository";
import type {
  CustomerAcquisitionSource,
  CustomerHealth,
  CustomerLifecycleStatus,
} from "@/lib/admin/customer-health";

export type AdminTimeSeriesPoint = {
  date: string;
  value: number;
};

export type AdminDistributionBucket = {
  label: string;
  count: number;
};

export type AdminOverviewMetrics = {
  totalRevenueCents: number;
  totalCustomers: number;
  totalPurchases: number;
  totalAssessments: number;
  assessmentToPurchaseRate: number;
  activePlans: number;
  completedPlans: number;
  failedPlans: number;
  averagePlanCompletion: number;
  averageCurrentDay: number;
  newCustomers7Days: number;
  newCustomers30Days: number;
  revenueOverTime: AdminTimeSeriesPoint[];
  purchasesOverTime: AdminTimeSeriesPoint[];
  newUsersOverTime: AdminTimeSeriesPoint[];
  planCompletionDistribution: AdminDistributionBucket[];
};

export type AdminCustomerRow = {
  customerKey: string;
  name: string;
  email: string;
  purchaseDate: string | null;
  amountPaidCents: number | null;
  planStatus: string | null;
  progressPercent: number | null;
  currentDay: number | null;
  lastLogin: string | null;
  lastActiveAt: string | null;
  emailStatus: string;
  userId: string | null;
  purchaseId: string | null;
  purchaseNumber: number;
  totalPurchasesForEmail: number;
  lifecycleStatus: CustomerLifecycleStatus;
  health: CustomerHealth;
  assessmentScore: number | null;
  source: CustomerAcquisitionSource;
  tags: string[];
  productSlug: string;
};

export type AdminCustomerPurchaseSummary = {
  customerKey: string;
  purchaseId: string;
  purchaseDate: string;
  amountPaidCents: number;
  planStatus: string | null;
  progressPercent: number | null;
  paymentStatus: string;
};

export type AdminActivityTimelineEvent = {
  id: string;
  occurredAt: string;
  label: string;
  detail?: string;
};

export type AdminCustomerSnapshot = {
  health: CustomerHealth;
  currentStage: string | null;
  daysSincePurchase: number | null;
  daysSinceLastLogin: number | null;
  lifetimeValueCents: number;
  currentDay: number | null;
  completionPercent: number | null;
  lastCompletedTask: string | null;
  nextRecommendedAction: string;
  productSlug: string;
  productName: string;
};

export type AdminCustomerDetail = {
  customerKey: string;
  name: string;
  email: string;
  userId: string | null;
  purchaseId: string | null;
  productSlug: string;
  joinDate: string | null;
  purchaseDate: string | null;
  amountPaidCents: number | null;
  totalRevenueCents: number;
  planTitle: string;
  planStatus: string | null;
  paymentStatus: string;
  progressPercent: number | null;
  currentDay: number | null;
  tasksCompleted: number;
  tasksRemaining: number;
  tasksSkipped: number;
  consecutiveDaysActive: number;
  lastLogin: string | null;
  lastDashboardActivity: string | null;
  lastCompletedTask: string | null;
  lifecycleStatus: CustomerLifecycleStatus;
  health: CustomerHealth;
  assessmentScore: number | null;
  source: CustomerAcquisitionSource;
  assessment: AssessmentRecord | null;
  snapshot: AdminCustomerSnapshot;
  assessmentInsights: {
    overallScore: number | null;
    topStrengths: string[];
    improvementAreas: string[];
    recommendedFocus: string[];
    recommendedResources: string[];
    currentStage: string | null;
    nextAction: string | null;
  };
  notes: Array<{
    id: string;
    body: string;
    createdBy: string;
    createdAt: string;
  }>;
  tags: string[];
  content: {
    planned: number;
    filmed: number;
    edited: number;
    posted: number;
  };
  learningInsights: Array<{
    id: string;
    dayNumber: number;
    prompt: string;
    response: string;
    createdAt: string;
  }>;
  emails: EmailDeliveryRecord[];
  allPurchases: AdminCustomerPurchaseSummary[];
  timeline: AdminActivityTimelineEvent[];
};

export type AdminNotificationItem = {
  id: string;
  severity: "info" | "success" | "warning" | "critical";
  title: string;
  detail: string;
  occurredAt: string;
  href?: string;
};

export type AdminTrendAnalytics = {
  revenueTrend: AdminTimeSeriesPoint[];
  purchasesByDay: AdminTimeSeriesPoint[];
  purchasesByWeek: AdminTimeSeriesPoint[];
  purchasesByMonth: AdminTimeSeriesPoint[];
  assessmentTrend: AdminTimeSeriesPoint[];
  averageCompletionRate: number;
  averageDaysToFinish: number | null;
  retentionActiveRate: number;
  atRiskCount: number;
};

export type AdminQueryOptions = {
  includeTestData?: boolean;
};

export type AdminRevenueMetrics = {
  revenueTodayCents: number;
  revenueWeekCents: number;
  revenueMonthCents: number;
  revenueAllTimeCents: number;
  averageOrderValueCents: number;
  refundsCents: number;
  dailyRevenue: AdminTimeSeriesPoint[];
  monthlyRevenue: AdminTimeSeriesPoint[];
  purchaseCountSeries: AdminTimeSeriesPoint[];
  totalPurchaseCount: number;
};

export type AdminConversionMetrics = {
  visitorsLabel: string;
  assessmentsStarted: number;
  assessmentsCompleted: number;
  purchased: number;
  currentlyActive: number;
  completedProgram: number;
  assessmentToPurchaseRate: number;
  purchaseToActiveRate: number;
  activeToCompletedRate: number;
  overallFunnelRate: number;
};

export type AdminEmailRow = EmailDeliveryRecord;

export type AdminAssessmentRow = {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  creatorStage: string;
  paymentStatus: string;
};

export type AdminPlanAnalytics = {
  activePlans: number;
  completedPlans: number;
  failedPlans: number;
  averageCompletion: number;
  averageCurrentDay: number;
  mostCompletedTasks: Array<{ title: string; count: number }>;
  mostSkippedTasks: Array<{ title: string; count: number }>;
  hasSkippedTaskData: boolean;
  completionTimeline: AdminTimeSeriesPoint[];
};

export type CreatorApplicationStatus =
  | "new"
  | "reviewing"
  | "approved"
  | "declined"
  | "follow_up";

export type PartnerInquiryStatus =
  | "new"
  | "contacted"
  | "in_conversation"
  | "partnered"
  | "not_fit";

export type ContactInquiryStatus = "new" | "replied" | "archived";

export type AdminCreatorApplicationRow = {
  id: string;
  name: string;
  email: string;
  instagram: string | null;
  niche: string | null;
  location: string | null;
  submittedAt: string;
  status: CreatorApplicationStatus;
  notes: string | null;
  source: string;
};

export type AdminPartnerInquiryRow = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  website: string | null;
  location: string | null;
  inquiryType: string;
  submittedAt: string;
  status: PartnerInquiryStatus;
  notes: string | null;
  source: string;
};

export type AdminContactInquiryRow = {
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: ContactInquiryStatus;
  notes: string | null;
};

export type AdminActivityMetrics = {
  activeToday: number;
  activeThisWeek: number;
  inactive7PlusDays: number;
  below20Percent: number;
  above80Percent: number;
  recentlyCompleted: Array<{
    customerKey: string;
    name: string;
    email: string;
    completedAt: string;
    progressPercent: number;
  }>;
};

export type AdminCustomerFilter =
  | "all"
  | "active"
  | "completed"
  | "inactive"
  | "refunded"
  | "not_started"
  | "high_engagement"
  | "low_engagement"
  | "on_track"
  | "needs_attention"
  | "at_risk"
  | "free_assessment"
  | "direct_purchase";