import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Globe,
  MapPin,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Hash,
  ExternalLink,
  Award,
  BarChart3,
  Newspaper,
} from "lucide-react";
import { CompanyGrowth } from "@/types/database";

interface GrowthDetailDialogProps {
  company: CompanyGrowth | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrowthDetailDialog({
  company,
  open,
  onOpenChange,
}: GrowthDetailDialogProps) {
  // Only render if dialog is open and company exists
  if (!open || !company) return null;

  // Utility function to parse competitors JSON string into HTML table
  const parseCompetitors = (competitors: string | undefined): string => {
    if (!competitors || competitors === "N/A" || competitors === "-") return "";
    try {
      const parsed = JSON.parse(competitors.replace(/'/g, '"'));
      if (Array.isArray(parsed)) {
        return `
          <table class="table table-bordered cstm-table">
            <thead>
              <tr style="background-color: rgb(71, 72, 102); color: white">
                <th scope="col">Name</th>
                <th scope="col">Title</th>
              </tr>
            </thead>
            <tbody>
              ${parsed
                .map(
                  (item) => `
                    <tr>
                      <td>${item.Name || "N/A"}</td>
                      <td>${item.Title || "N/A"}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        `;
      }
      return competitors; // Return as-is if not an array
    } catch (e) {
      return competitors; // Return raw string if parsing fails
    }
  };

  // Utility to strip <a> tags and their content from HTML
  const stripLinksAndNames = (html: string) =>
    html.replace(/<a [^>]+>.*?<\/a>/gi, "").replace(/<u>.*?<\/u>/gi, "");

  const getCompanyImage = (company: CompanyGrowth) => {
    if (company.image && company.image !== "-") {
      return `https://kluqlibhlkcsuighyczd.supabase.co/storage/v1/object/public/companies/High-growth/${company.image}`;
    }
    return null;
  };

  // Clean up escape characters in text
  const cleanText = (text: string | null | undefined): string => {
    if (!text) return "";
    return text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\\t/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/r',/g, "")
      .replace(/r'/g, "")
      .replace(/',/g, "")
      .replace(/\['/g, "")
      .replace(/'\]/g, "")
      .replace(/^[',\s]+|[',\s]+$/g, "")
      .trim();
  };

  const renderField = (
    label: string,
    value: any,
    icon?: React.ReactNode,
    colorScheme?: string,
  ) => {
    if (!value || value === "-" || value === "N/A") return null;

    const getColorScheme = (scheme: string = "default") => {
      switch (scheme) {
        case "blue":
          return "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800";
        case "green":
          return "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800";
        case "purple":
          return "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800";
        case "orange":
          return "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800";
        case "teal":
          return "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800";
        case "indigo":
          return "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800";
        case "rose":
          return "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800";
        case "yellow":
          return "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
        default:
          return "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
      }
    };

    const getIconColor = (scheme: string = "default") => {
      switch (scheme) {
        case "blue":
          return "text-blue-600 dark:text-blue-400";
        case "green":
          return "text-emerald-600 dark:text-emerald-400";
        case "purple":
          return "text-purple-600 dark:text-purple-400";
        case "orange":
          return "text-orange-600 dark:text-orange-400";
        case "teal":
          return "text-teal-600 dark:text-teal-400";
        case "indigo":
          return "text-indigo-600 dark:text-indigo-400";
        case "rose":
          return "text-rose-600 dark:text-rose-400";
        case "yellow":
          return "text-amber-600 dark:text-amber-400";
        default:
          return "text-slate-600 dark:text-slate-400";
      }
    };

    return (
      <div className={`p-5 rounded-xl border ${getColorScheme(colorScheme)} hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center gap-3 mb-3">
          {icon && (
            <div className={`w-8 h-8 rounded-lg ${getIconColor(colorScheme)} bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
              {icon}
            </div>
          )}
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </h4>
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-white whitespace-pre-wrap">
          {value}
        </div>
      </div>
    );
  };

  const renderTableData = (
    label: string,
    htmlContent: string,
    colorScheme: string = "default",
  ) => {
    if (!htmlContent || htmlContent === "-" || htmlContent === "N/A")
      return null;

    const getTableColorScheme = (scheme: string) => {
      switch (scheme) {
        case "blue":
          return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200";
        case "green":
          return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
        case "purple":
          return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200";
        case "orange":
          return "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200";
        case "teal":
          return "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200";
        case "rose":
          return "bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200";
        default:
          return "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200";
      }
    };

    const getIconColor = (scheme: string) => {
      switch (scheme) {
        case "blue":
          return "text-blue-600";
        case "green":
          return "text-green-600";
        case "purple":
          return "text-purple-600";
        case "orange":
          return "text-orange-600";
        case "teal":
          return "text-teal-600";
        case "rose":
          return "text-rose-600";
        default:
          return "text-slate-600";
      }
    };

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Hash className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
            {label}
          </h4>
        </div>
        <div className="p-6">
          <div
            className="prose prose-sm max-w-none dark:prose-invert [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-200 dark:[&_table]:border-slate-700 [&_table]:rounded-lg [&_table]:overflow-hidden [&_th]:bg-slate-50 dark:[&_th]:bg-slate-800 [&_th]:text-slate-900 dark:[&_th]:text-white [&_th]:p-4 [&_th]:text-left [&_th]:border-b [&_th]:border-slate-200 dark:[&_th]:border-slate-700 [&_th]:font-semibold [&_td]:p-4 [&_td]:border-b [&_td]:border-slate-200 dark:[&_td]:border-slate-700 [&_td]:text-slate-900 dark:[&_td]:text-white [&_tr:nth-child(even)]:bg-slate-50/50 dark:[&_tr:nth-child(even)]:bg-slate-800/30 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:hover:underline dark:text-white"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    );
  };

  // Helper to strip company links but keep names as plain text (not links) for Other Companies and Competitors
  function stripCompanyLinksKeepNames(html: string): string {
    // Remove <td> or <th> that contains only #<number>
    let cleaned = html.replace(/<t[dh]\s*>\s*#\d+\s*<\/t[dh]>/gi, "");
    // Replace <a ...>...</a> with just the inner text (company name)
    cleaned = cleaned.replace(/<a [^>]*>(.*?)<\/a>/gis, "$1");
    return cleaned;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-slate-50 dark:bg-slate-950">
        <DialogHeader className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-8 flex-shrink-0">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {getCompanyImage(company) ? (
                <img
                  src={getCompanyImage(company)!}
                  alt={company.name || "Company"}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {company.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {company.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Growth Company
                </span>
                {company.growjoRanking && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <Award className="w-4 h-4 mr-1" />
                    Rank {(company as any).growjo_ranking}
                  </span>
                )}
                {company.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Building2 className="w-4 h-4 mr-1" />
                    {company.industry}
                  </span>
                )}
              </div>
              {company.location && (
                <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-8 py-6">
          <div className="space-y-8">
            {/* Description */}
            {/* {(company.description || company.whatIs || company.long_description || company.short_description) && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-5 shadow-sm mb-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Description
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {company.description || company.whatIs || company.long_description || company.short_description}
                </p>
              </div>
            )} */}


            {/* Company Description */}
            {company.whatIs && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  About {company.name}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                  {cleanText(company.whatIs)}
                </p>
              </div>
            )}

            {/* Financial Performance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Financial Performance
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderField(
                  "Annual Revenue",
                  (company as any).annual_revenue || (company as any).estimated_revenue,
                  <DollarSign className="h-4 w-4" />,
                  "green",
                )}
                {renderField(
                  "Total Funding",
                  (company as any).total_funding || (company as any).total_funding_duplicate,
                  <DollarSign className="h-4 w-4" />,
                  "indigo",
                )}
                {renderField(
                  "Valuation",
                  (company as any).current_valuation || (company as any).valuation,
                  <TrendingUp className="h-4 w-4" />,
                  "purple",
                )}
              </div>
              {/* Additional Financial Metrics Row */}
              {(company as any).estimated_revenue_per_employee && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-6">
                    {renderField(
                      "Revenue Per Employee",
                      `$${(company as any).estimated_revenue_per_employee}`,
                      <DollarSign className="h-4 w-4" />,
                      "teal",
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Team & Growth */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Team & Growth
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField(
                  "Employees",
                  (company as any).employees || (company as any).number_of_employees,
                  <Users className="h-4 w-4" />,
                  "blue",
                )}
                {renderField(
                  "Growth Rate",
                  (company as any).grew_employee_count || (company as any).employee_growth_percent,
                  <TrendingUp className="h-4 w-4" />,
                  "green",
                )}
              </div>
            </div>


            {/* Additional Metrics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Target className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Additional Metrics
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderField(
                  "Ranking",
                  (company as any).growjo_ranking,
                  <Award className="h-4 w-4" />,
                  "amber",
                )}
                {renderField(
                  "Industry",
                  company.industry,
                  <Building2 className="h-4 w-4" />,
                  "purple",
                )}
                {renderField(
                  "Location",
                  company.location,
                  <MapPin className="h-4 w-4" />,
                  "teal",
                )}
              </div>
            </div>

            {/* Detailed Information Tables */}
            <div className="space-y-6">
              {company.competitors &&
                renderTableData(
                  "Key Employees",
                  stripCompanyLinksKeepNames(
                    parseCompetitors(company.competitors),
                  ),
                )}
              {company.other_companies &&
                renderTableData(
                  "Other Companies",
                  stripCompanyLinksKeepNames(company.other_companies),
                )}
              {company.funding_table &&
                renderTableData("Funding History", company.funding_table)}
              {company.news_table &&
                renderTableData("Recent News", company.news_table)}
              {company.employees_table &&
                renderTableData("Employee Information", company.employees_table)}
              {company.revenue_table &&
                renderTableData("Revenue Breakdown", company.revenue_table)}
              {company.valuation_table &&
                renderTableData("Valuation History", company.valuation_table)}
              {company.growth_metrics_table &&
                renderTableData("Growth Metrics", company.growth_metrics_table)}
              {company.accelerator_table &&
                renderTableData(
                  "Accelerator Information",
                  company.accelerator_table,
                )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
