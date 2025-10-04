export interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
}

export interface CompanyStartup {
  id: number;
  image?: string;
  name?: string;
  country?: string;
  state?: string;
  rank?: string;
  srScore2?: string;
  srWeb?: string;
  srSocial?: string;
  shortDescription?: string;
  longDescription?: string;
  website?: string;
  founded?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  tags?: string;
  mozDomainAuth?: string;
  mozPageAuth?: string;
  facebookFans?: string;
  facebookEngagement?: string;
  twitterFollowers?: string;
  twitterEngagement?: string;
  competitorsTable?: string;
  fundingTable?: string;
  acquisitionsTable?: string;
  productsTable?: string;
  teamTable?: string;
  newsTable?: string;
  statisticsTable?: string;
  createdAt?: string;
  updatedAt?: string;
  url?: string;
}

export interface CompanyGrowth {
  id: number;
  url?: string;
  name?: string;
  location?: string;
  growjoRanking?: string;
  industry?: string;
  annualRevenue?: string;
  estimatedRevenuePerEmployee?: string;
  totalFunding?: string;
  currentValuation?: string;
  employees?: string;
  grewEmployeeCount?: string;
  competitors?: string;
  news?: string;
  totalFundingDuplicate?: string;
  numberOfEmployees?: string;
  estimatedRevenue?: string;
  employeeGrowthPercent?: string;
  valuation?: string;
  accelerator?: string;
  whatIs?: string;
  image?: string;
  anthropicCompetitors?: string;
  otherCompanies?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyFranchise {
  id: number;
  url?: string;
  title?: string;
  image?: string;
  rank?: string;
  rankYear?: string;
  initialInvestment?: string;
  unitsAsOf2024?: string;
  description?: string;
  relatedFranchises?: any;
  industry?: string;
  relatedCategories?: string;
  founded?: number;
  parentCompany?: string;
  leadership?: string;
  corporateAddress?: string;
  social?: string;
  franchisingSince?: string;
  numOfEmployeesAtHq?: number;
  whereSeeking?: string;
  numOfUnits?: number;
  initialFranchiseFee?: string;
  netWorthRequirement?: string;
  cashRequirement?: string;
  royaltyFee?: string;
  adRoyaltyFee?: string;
  termOfAgreement?: string;
  isFranchiseTermRenewable?: boolean;
  thirdPartyFinancing?: string;
  onTheJobTraining?: string;
  classroomTraining?: string;
  ongoingSupport?: string;
  marketingSupport?: string;
  isAbsenteeOwnershipAllowed?: boolean;
  canThisFranchiseBeRunFromHome?: boolean;
  canThisFranchiseBeRunPartTime?: boolean;
  areExclusiveTerritoriesAvailable?: boolean;
  numOfEmployeesRequiredToRun?: number;
  veteranIncentives?: string;
  inHouseFinancing?: string;
}

export interface CompanyVc {
  id: number;
  url?: string;
  title?: string;
  founded?: string;
  aum?: string;
  location?: string;
  investmentTicket?: string;
  investmentHorizon?: string;
  investmentStage?: string;
  exitStrategy?: string;
  image?: string;
  profile?: string;
  industry?: string;
  regionOfInvestment?: string;
  funds?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Accelerator {
  id: number;
  name?: string;
  type?: string;
  website?: string;
  country?: string;
  city?: string;
  industries?: string;
  founders?: string;
  foundedDate?: string;
  numberOfInvestments?: number;
  numberOfExits?: number;
}

export interface Event {
  id: number;
  eventName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  link?: string;
}

export interface FundingRound {
  id: number;
  company?: string;
  exitValueBillions?: number;
  exitType?: string;
  totalFundingMillions?: number;
  industry?: string;
  dealClosedDate?: string;
}

export interface FundingRoundMaDeal {
  id: number;
  announcedDate?: string;
  acquiringCompany?: string;
  acquiredCompany?: string;
  dealSizeBillions?: number;
  dealSizeOriginal?: string;
  acquiringCompanyLogo?: string | null;
  acquiredCompanyLogo?: string | null;
}

export interface FundingRoundMegadeal {
  id: number;
  rank?: number;
  valueUsd?: number;
  acquiredCountry?: string;
  acquiredEntity?: string;
  acquirerCountry?: string;
  acquirerEntity?: string;
  year?: number;
  transactionType?: string;
}

export interface FundingRoundUs {
  id: number;
  company?: string;
  amount?: number;
  leadInvestors?: string;
  valuation?: number;
  industry?: string;
  dateReported?: string;
}

export interface Unicorn {
  id: number;
  company: string;
  postMoneyValue?: string;
  totalEquityFunding?: string;
  leadInvestors?: string;
  country?: string;
  continent?: string;
  type?: string;
  foundedYear?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Investor {
  id: number;
  name?: string;
  currentPosition?: string;
  profile?: string;
  type?: string;
  location?: string;
  investmentMin?: string | number;
  investmentMax?: string | number;
  sweetSpot?: string | number;
  currentFundSize?: string | number;
  experiences?: string[];
  url?: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  totalCompanies: number;
  activeRounds: number;
  totalFunding: string;
  newUnicorns: number;
}

export interface Grant {
  id: string;
  title?: string;
  acronym?: string;
  projectId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  overallBudget?: number;
  euContribution?: number;
  coordinatedBy?: string;
  fundedUnder?: string;
  objective?: string;
  programme?: string;
  topic?: string;
  typeOfAction?: string;
}

export interface LiveFunding {
  id: number;
  createdAt?: string;
  companyName?: string;
  roundType?: string;
  fundingAmount?: number;
  currency?: string;
  ceo?: any;
  companyInfo?: any;
  mainCategory?: string;
  dateSeen?: string;
  country?: string;
  size?: string;
}
