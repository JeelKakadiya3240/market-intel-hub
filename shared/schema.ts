import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  numeric,
  date,
  timestamp,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").default("investor"), // investor, founder, analyst
  createdAt: timestamp("created_at").defaultNow(),
});

export const accelerators = pgTable("accelerators", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  name: text("name"),
  website: text("website"),
  country: text("country"),
  city: text("city"),
  industries: text("industries"),
  founders: text("founders"),
  foundedDate: date("founded_date"),
  numberOfInvestments: integer("number_of_investments"),
  numberOfExits: integer("number_of_exits"),
});

export const incubators = pgTable("incubators", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  url: text("url"),
  name: text("name"),
  found: numeric("found"),
  shortDescription: text("short_description"),
  website: text("website"),
  description: text("description"),
  programType: text("program_type"),
  categories: text("categories"),
  duration: text("duration"),
  country: text("country"),
  fundingType: text("funding_type"),
  otherBenefits: text("other_benefits"),
  applicationStatus: text("application_status"),
  cohortsPerYear: integer("cohorts_per_year"),
  startupsInvested: integer("startups_invested"),
  crunchbaseRank: integer("crunchbase_rank"),
  image: text("image"),
  cityState: text("city_state"),
  offer: text("offer"),
  startDate: date("start_date"),
  exits: integer("exits"),
  totalFundingRaisedByStartups: numeric("total_funding_raised_by_startups"),
  offerDetails: text("offer_details"),
  visaAndRelocationSupport: text("visa_and_relocation_support"),
  applicationDeadline: date("application_deadline"),
  programFee: numeric("program_fee"),
  alumniStartups: integer("alumni_startups"),
  startupsPerCohort: integer("startups_per_cohort"),
  investmentsPerYear: integer("investments_per_year"),
});

export const companiesFranchises = pgTable("companies_franchises", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  url: text("url"),
  title: text("title"),
  image: text("image"),
  rank: text("rank"),
  rankYear: text("rank_year"),
  initialInvestment: text("initial_investment"),
  unitsAsOf2024: text("units_as_of_2024"),
  description: text("description"),
  relatedFranchises: jsonb("related_franchises"),
  industry: text("industry"),
  relatedCategories: text("related_categories"),
  founded: numeric("founded"),
  parentCompany: text("parent_company"),
  leadership: text("leadership"),
  corporateAddress: text("corporate_address"),
  social: text("social"),
  franchisingsSince: text("franchising_since"),
  numOfEmployeesAtHq: integer("num_of_employees_at_hq"),
  whereSeeking: text("where_seeking"),
  numOfUnits: integer("num_of_units"),
  initialFranchiseFee: text("initial_franchise_fee"),
  netWorthRequirement: text("net_worth_requirement"),
  cashRequirement: text("cash_requirement"),
  royaltyFee: text("royalty_fee"),
  adRoyaltyFee: text("ad_royalty_fee"),
  termOfAgreement: text("term_of_agreement"),
  isFranchiseTermRenewable: boolean("is_franchise_term_renewable"),
  thirdPartyFinancing: text("third_party_financing"),
  onTheJobTraining: text("on_the_job_training"),
  classroomTraining: text("classroom_training"),
  ongoingSupport: text("ongoing_support"),
  marketingSupport: text("marketing_support"),
  isAbsenteeOwnershipAllowed: boolean("is_absentee_ownership_allowed"),
  canThisFranchiseBeRunFromHome: boolean("can_this_franchise_be_run_from_home"),
  canThisFranchiseBeRunPartTime: boolean("can_this_franchise_be_run_part_time"),
  areExclusiveTerritoriesAvailable: boolean(
    "are_exclusive_territories_available",
  ),
  numOfEmployeesRequiredToRun: integer("num_of_employees_required_to_run"),
  veteranIncentives: text("veteran_incentives"),
  inHouseFinancing: text("in_house_financing"),
});

export const companiesGrowth = pgTable("companies_growth", {
  id: serial("id").primaryKey(),
  url: text("url"),
  name: text("name"),
  location: text("location"),
  growjoRanking: text("growjo_ranking"),
  industry: text("industry"),
  annualRevenue: text("annual_revenue"),
  estimatedRevenuePerEmployee: text("estimated_revenue_per_employee"),
  totalFunding: text("total_funding"),
  currentValuation: text("current_valuation"),
  employees: text("employees"),
  grewEmployeeCount: text("grew_employee_count"),
  competitors: text("competitors"),
  news: text("news"),
  totalFundingDuplicate: text("total_funding_duplicate"),
  numberOfEmployees: text("number_of_employees"),
  estimatedRevenue: text("estimated_revenue"),
  employeeGrowthPercent: text("employee_growth_percent"),
  valuation: text("valuation"),
  accelerator: text("accelerator"),
  whatIs: text("what_is"),
  image: text("image"),
  anthropicCompetitors: text("anthropic_competitors"),
  otherCompanies: text("other_companies"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companiesStartups = pgTable("companies_startups", {
  id: serial("id").primaryKey(),
  image: text("image"),
  name: text("name"),
  country: text("country"),
  state: text("state"),
  rank: text("rank"),
  srScore2: text("sr_score2"),
  srWeb: text("sr_web"),
  srSocial: text("sr_social"),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  website: text("website"),
  founded: text("founded"),
  facebook: text("facebook"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
  tags: text("tags"),
  mozDomainAuth: text("moz_domain_auth"),
  mozPageAuth: text("moz_page_auth"),
  facebookFans: text("facebook_fans"),
  facebookEngagement: text("facebook_engagement"),
  twitterFollowers: text("twitter_followers"),
  twitterEngagement: text("twitter_engagement"),
  competitorsTable: text("competitors_table"),
  fundingTable: text("funding_table"),
  acquisitionsTable: text("acquisitions_table"),
  productsTable: text("products_table"),
  teamTable: text("team_table"),
  newsTable: text("news_table"),
  statisticsTable: text("statistics_table"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  url: text("url"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name"),
  location: text("location"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  eventType: text("event_type"),
  link: text("link"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const eventsEuropeanStartup = pgTable("events_european_startup", {
  id: serial("id").primaryKey(),
  dateText: text("date_text"),
  eventName: text("event_name"),
  month: text("month"),
  location: text("location"),
  websiteUrl: text("website_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const rankingsTopCities = pgTable("rankings_top_cities", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  rankChange: text("rank_change"),
  totalScore: numeric("total_score", { precision: 8, scale: 3 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const rankingsTopCountries = pgTable("rankings_top_countries", {
  id: serial("id").primaryKey(),
  rank: integer("rank").notNull(),
  country: text("country").notNull(),
  rankChange: text("rank_change"),
  totalScore: numeric("total_score", { precision: 8, scale: 3 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const rankingsUniversities = pgTable("rankings_universities", {
  id: serial("id").primaryKey(),
  rank: integer("rank"),
  name: text("name").notNull(),
  country: text("country"),
  studentPopulation: integer("student_population"),
  studentsToStaffRatio: numeric("students_to_staff_ratio", {
    precision: 4,
    scale: 1,
  }),
  internationalStudents: text("international_students"),
  femaleToMaleRatio: text("female_to_male_ratio"),
  overallScore: numeric("overall_score", { precision: 4, scale: 1 }),
  teachingScore: numeric("teaching_score", { precision: 4, scale: 1 }),
  researchEnvironmentScore: numeric("research_environment_score", {
    precision: 4,
    scale: 1,
  }),
  researchQualityScore: numeric("research_quality_score", {
    precision: 4,
    scale: 1,
  }),
  industryImpactScore: numeric("industry_impact_score", {
    precision: 4,
    scale: 1,
  }),
  internationalOutlookScore: numeric("international_outlook_score", {
    precision: 4,
    scale: 1,
  }),
  year: integer("year"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sanctionListExtended = pgTable("sanction_list_extended", {
  id: serial("id").primaryKey(),
  name: text("name"),
  regionOrAddress: text("region_or_address"),
  entityType: text("entity_type"),
  programs: text("programs"),
  listType: text("list_type"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sanctionListIndividual = pgTable("sanction_list_individual", {
  id: serial("id").primaryKey(),
  individualId: text("individual_id"),
  referenceNumber: text("reference_number"),
  fullName: text("full_name"),
  listedOn: text("listed_on"),
  comments: text("comments"),
  title: text("title"),
  designation: text("designation"),
  individualDateOfBirth: text("individual_date_of_birth"),
  individualPlaceOfBirth: text("individual_place_of_birth"),
  individualAlias: text("individual_alias"),
  nationality: text("nationality"),
  individualDocument: text("individual_document"),
  individualAddress: text("individual_address"),
  applicationStatus: text("application_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const fundingRoundsExits = pgTable("funding_rounds_exits", {
  id: serial("id").primaryKey(),
  company: text("company"),
  exitValueBillions: numeric("exit_value_billions", {
    precision: 10,
    scale: 2,
  }),
  exitType: text("exit_type"),
  totalFundingMillions: numeric("total_funding_millions", {
    precision: 15,
    scale: 2,
  }),
  industry: text("industry"),
  dealClosedDate: date("deal_closed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundingRoundsMaDeals = pgTable("funding_rounds_ma_deals", {
  id: serial("id").primaryKey(),
  announcedDate: date("announced_date"),
  acquiringCompany: text("acquiring_company"),
  acquiredCompany: text("acquired_company"),
  dealSizeBillions: numeric("deal_size_billions", { precision: 20, scale: 3 }),
  dealSizeOriginal: text("deal_size_original"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundingRoundsMegadeals = pgTable("funding_rounds_megadeals", {
  id: serial("id").primaryKey(),
  rank: integer("rank"),
  valueUsd: numeric("value_usd", { precision: 20, scale: 2 }),
  acquiredCountry: text("acquired_country"),
  acquiredEntity: text("acquired_entity"),
  acquirerCountry: text("acquirer_country"),
  acquirerEntity: text("acquirer_entity"),
  year: integer("year"),
  transactionType: text("transaction_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundingRoundsUsSfd23 = pgTable("funding_rounds_us_sfd_23", {
  id: serial("id").primaryKey(),
  company: text("company"),
  amount: numeric("amount", { precision: 20, scale: 2 }),
  leadInvestors: text("lead_investors"),
  valuation: numeric("valuation", { precision: 20, scale: 2 }),
  industry: text("industry"),
  dateReported: date("date_reported"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundingRoundsUsSfd24 = pgTable("funding_rounds_us_sfd_24", {
  id: serial("id").primaryKey(),
  company: text("company"),
  amount: numeric("amount", { precision: 20, scale: 2 }),
  leadInvestors: text("lead_investors"),
  valuation: numeric("valuation", { precision: 20, scale: 2 }),
  industry: text("industry"),
  dateReported: date("date_reported"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const liveFunding = pgTable("live_funding", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  companyName: text("company_name"),
  roundType: text("round_type"),
  fundingAmount: numeric("funding_amount"),
  currency: text("currency"),
  ceo: jsonb("ceo"),
  companyInfo: jsonb("company_info"),
  mainCategory: text("main_category"),
  dateSeen: date("date_seen"),
  country: text("country"),
  size: text("size"),
});

export const unicorns = pgTable("unicorns", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  postMoneyValue: text("post_money_value"),
  totalEquityFunding: text("total_equity_funding"),
  leadInvestors: text("lead_investors"),
  country: text("country"),
  continent: text("continent"),
  type: text("type").default("biggest"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const investors = pgTable("investors", {
  id: serial("id").primaryKey(),
  url: text("url"),
  name: text("name"),
  type: text("type"),
  profile: text("profile"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  connections: numeric("connections"),
  imagePath: text("image_path"),
  currentPosition: text("current_position"),
  investmentMin: numeric("investment_min", { precision: 12, scale: 2 }),
  investmentMax: numeric("investment_max", { precision: 12, scale: 2 }),
  sweetSpot: numeric("sweet_spot", { precision: 12, scale: 2 }),
  currentFundSize: numeric("current_fund_size", { precision: 12, scale: 2 }),
  ranking: text("ranking"),
  experiences: text("experiences").array(),
  education: text("education").array(),
  investments: text("investments"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const grants = pgTable("grants", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  title: text("title"),
  acronym: text("acronym"),
  projectId: text("project_id"),
  status: text("status"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  overallBudget: numeric("overall_budget", { precision: 20, scale: 2 }),
  euContribution: numeric("eu_contribution", { precision: 20, scale: 2 }),
  coordinatedBy: text("coordinated_by"),
  fundedUnder: text("funded_under"),
  objective: text("objective"),
  programme: text("programme"),
  topic: text("topic"),
  typeOfAction: text("type_of_action"),
});

export const companiesVc = pgTable("companies_vc", {
  id: serial("id").primaryKey(),
  url: text("url"),
  title: text("title"),
  founded: text("founded"),
  aum: text("aum"),
  location: text("location"),
  investmentTicket: text("investment_ticket"),
  investmentHorizon: text("investment_horizon"),
  investmentStage: text("investment_stage"),
  exitStrategy: text("exit_strategy"),
  image: text("image"),
  profile: text("profile"),
  industry: text("industry"),
  regionOfInvestment: text("region_of_investment"),
  funds: text("funds"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const investorContacts = pgTable("investor_contacts", {
  id: text("id").primaryKey(),
  companyName: text("company_name"),
  employeesPeopleDatabase: text("employees_people_database"),
  numberOfInvestments: text("number_of_investments"),
  numberOfExits: text("number_of_exits"),
  location: text("location"),
  investorType: text("investor_type"),
  description: text("description"),
  companyUrl: text("company_url"),
  domain: text("domain"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  contactEmail: text("contact_email"),
  contactEmailVerified: text("contact_email_verified?"),
  secondEmailVerified: text("2nd_email_100%_verified"),
  phoneNumber: text("phone_number"),
  industries: text("industries"),
  program: text("program"),
  keyPeople: text("key_people"),
  country: text("country"),
  // Additional fields to match investors table
  connections: numeric("connections"),
  imagePath: text("image_path"),
  currentPosition: text("current_position"),
  investmentMin: numeric("investment_min", { precision: 12, scale: 2 }),
  investmentMax: numeric("investment_max", { precision: 12, scale: 2 }),
  sweetSpot: numeric("sweet_spot", { precision: 12, scale: 2 }),
  currentFundSize: numeric("current_fund_size", { precision: 12, scale: 2 }),
  ranking: text("ranking"),
  experiences: text("experiences").array(),
  education: text("education").array(),
  investments: text("investments"),
  _1: text("_1"),
  _2: text("_2"),
  _3: text("_3"),
  _4: text("_4"),
  _5: text("_5"),
  _6: text("_6"),
  _7: text("_7"),
});

export const mA = pgTable("m_a", {
  id: serial("id").primaryKey(),
  companyName: text("company_name"),
  acquiredBy: text("acquired_by"),
  namePath: text("name_path"),
  mainCategory: text("main_category"),
  dateSeen: date("date_seen"),
  createdAt: timestamp("created_at").defaultNow(),
  acquiredByLinkedinUrl: text("acquired_by_linkedin_url"),
  companyInfo: jsonb("company_info"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAcceleratorSchema = createInsertSchema(accelerators).omit({
  id: true,
});

export const insertIncubatorSchema = createInsertSchema(incubators).omit({
  id: true,
});

export const insertCompanyFranchiseSchema = createInsertSchema(
  companiesFranchises,
).omit({
  id: true,
});

export const insertCompanyGrowthSchema = createInsertSchema(
  companiesGrowth,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyStartupSchema = createInsertSchema(
  companiesStartups,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventEuropeanStartupSchema = createInsertSchema(
  eventsEuropeanStartup,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRankingTopCitySchema = createInsertSchema(
  rankingsTopCities,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRankingTopCountrySchema = createInsertSchema(
  rankingsTopCountries,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRankingUniversitySchema = createInsertSchema(
  rankingsUniversities,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSanctionListExtendedSchema = createInsertSchema(
  sanctionListExtended,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSanctionListIndividualSchema = createInsertSchema(
  sanctionListIndividual,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundingRoundExitSchema = createInsertSchema(
  fundingRoundsExits,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundingRoundMaDealSchema = createInsertSchema(
  fundingRoundsMaDeals,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundingRoundMegadealSchema = createInsertSchema(
  fundingRoundsMegadeals,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundingRoundUsSfd23Schema = createInsertSchema(
  fundingRoundsUsSfd23,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundingRoundUsSfd24Schema = createInsertSchema(
  fundingRoundsUsSfd24,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUnicornSchema = createInsertSchema(unicorns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestorSchema = createInsertSchema(investors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestorContactSchema = createInsertSchema(investorContacts);

export const insertGrantSchema = createInsertSchema(grants).omit({
  id: true,
});

export const insertCompanyVcSchema = createInsertSchema(companiesVc).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLiveFundingSchema = createInsertSchema(liveFunding).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Accelerator = typeof accelerators.$inferSelect;
export type InsertAccelerator = z.infer<typeof insertAcceleratorSchema>;
export type Incubator = typeof incubators.$inferSelect;
export type InsertIncubator = z.infer<typeof insertIncubatorSchema>;
export type CompanyFranchise = typeof companiesFranchises.$inferSelect;
export type InsertCompanyFranchise = z.infer<
  typeof insertCompanyFranchiseSchema
>;
export type CompanyGrowth = typeof companiesGrowth.$inferSelect;
export type InsertCompanyGrowth = z.infer<typeof insertCompanyGrowthSchema>;
export type CompanyStartup = typeof companiesStartups.$inferSelect;
export type InsertCompanyStartup = z.infer<typeof insertCompanyStartupSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventEuropeanStartup = typeof eventsEuropeanStartup.$inferSelect;
export type InsertEventEuropeanStartup = z.infer<
  typeof insertEventEuropeanStartupSchema
>;
export type RankingTopCity = typeof rankingsTopCities.$inferSelect;
export type InsertRankingTopCity = z.infer<typeof insertRankingTopCitySchema>;
export type RankingTopCountry = typeof rankingsTopCountries.$inferSelect;
export type InsertRankingTopCountry = z.infer<
  typeof insertRankingTopCountrySchema
>;
export type RankingUniversity = typeof rankingsUniversities.$inferSelect;
export type InsertRankingUniversity = z.infer<
  typeof insertRankingUniversitySchema
>;
export type SanctionListExtended = typeof sanctionListExtended.$inferSelect;
export type InsertSanctionListExtended = z.infer<
  typeof insertSanctionListExtendedSchema
>;
export type SanctionListIndividual = typeof sanctionListIndividual.$inferSelect;
export type InsertSanctionListIndividual = z.infer<
  typeof insertSanctionListIndividualSchema
>;
export type FundingRoundExit = typeof fundingRoundsExits.$inferSelect;
export type InsertFundingRoundExit = z.infer<
  typeof insertFundingRoundExitSchema
>;
export type FundingRoundMaDeal = typeof fundingRoundsMaDeals.$inferSelect;
export type InsertFundingRoundMaDeal = z.infer<
  typeof insertFundingRoundMaDealSchema
>;
export type FundingRoundMegadeal = typeof fundingRoundsMegadeals.$inferSelect;
export type InsertFundingRoundMegadeal = z.infer<
  typeof insertFundingRoundMegadealSchema
>;
export type FundingRoundUsSfd23 = typeof fundingRoundsUsSfd23.$inferSelect;
export type InsertFundingRoundUsSfd23 = z.infer<
  typeof insertFundingRoundUsSfd23Schema
>;
export type FundingRoundUsSfd24 = typeof fundingRoundsUsSfd24.$inferSelect;
export type InsertFundingRoundUsSfd24 = z.infer<
  typeof insertFundingRoundUsSfd24Schema
>;
export type Unicorn = typeof unicorns.$inferSelect;
export type InsertUnicorn = z.infer<typeof insertUnicornSchema>;
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type InvestorContact = typeof investorContacts.$inferSelect;
export type InsertInvestorContact = z.infer<typeof insertInvestorContactSchema>;
export type Grant = typeof grants.$inferSelect;
export type InsertGrant = z.infer<typeof insertGrantSchema>;
export type CompanyVc = typeof companiesVc.$inferSelect;
export type InsertCompanyVc = z.infer<typeof insertCompanyVcSchema>;
export type LiveFunding = typeof liveFunding.$inferSelect;
export type InsertLiveFunding = z.infer<typeof insertLiveFundingSchema>;

// XBRL Filings Types for Financial Statements
export interface XBRLFiling {
  id: string;
  type: string;
  attributes: {
    entity_name?: string;
    language?: string;
    country: string;
    period_ending?: string;
    period_end?: string;
    date_added: string;
    package_url?: string;
    viewer_url?: string;
    processed: string;
    programme?: string;
  };
  relationships?: {
    entity?: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface XBRLEntity {
  id: string;
  type: string;
  attributes: {
    name: string;
    country: string;
    lei?: string;
    website?: string;
  };
}

export interface XBRLApiResponse {
  data: XBRLFiling[];
  included?: XBRLEntity[];
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
    self?: string;
  };
  meta?: {
    count?: number;
  };
  success?: boolean;
  message?: string;
}
