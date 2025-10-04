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
  Calendar,
  DollarSign,
  Award,
  ExternalLink,
  Hash,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  Shield,
  BookOpen,
} from "lucide-react";
import { CompanyFranchise } from "@/types/database";

interface FranchiseDetailDialogProps {
  company: CompanyFranchise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FranchiseDetailDialog({
  company,
  open,
  onOpenChange,
}: FranchiseDetailDialogProps) {
  if (!company) return null;

  const getCompanyImage = (company: CompanyFranchise) => {
    if (company.image && company.image !== "-") {
      return `https://kluqlibhlkcsuighyczd.supabase.co/storage/v1/object/public/companies/Franchises/${company.image}`;
    }
    return null;
  };

  // Utility function to parse related_franchises JSON string into HTML table
  const parseRelatedFranchises = (
    relatedFranchises: string | undefined,
  ): string => {
    if (
      !relatedFranchises ||
      relatedFranchises === "N/A" ||
      relatedFranchises === "-"
    )
      return "";
    try {
      const parsed = JSON.parse(relatedFranchises.replace(/'/g, '"'));
      if (Array.isArray(parsed)) {
        return `
          <table class="table table-bordered cstm-table">
            <thead>
              <tr style="background-color: rgb(71, 72, 102); color: white">
                <th scope="col">Name</th>
                <th scope="col">Link</th>
              </tr>
            </thead>
            <tbody>
              ${parsed
                .map(
                  (item) => `
                    <tr>
                      <td>${item.Name || "N/A"}</td>
                      <td><a href="${item.Link || "#"}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${item.Link || "N/A"}</a></td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        `;
      }
      return relatedFranchises; // Return as-is if not an array
    } catch (e) {
      return relatedFranchises; // Return raw string if parsing fails
    }
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

  const renderField = (label: string, value: any, icon?: React.ReactNode) => {
    if (!value || value === "-" || value === "N/A") return null;

    return (
      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        {icon && <div className="text-slate-600 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
            {label}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
            {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-lg flex-shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {getCompanyImage(company) ? (
              <img
                src={getCompanyImage(company)!}
                alt={company.title || "Company"}
                className="w-12 h-12 rounded-lg object-cover border border-purple-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-300 to-pink-400 flex items-center justify-center text-purple-800 font-bold text-lg">
                {company.title?.charAt(0) || "?"}
              </div>
            )}
            {company.title}
          </DialogTitle>
          <p className="text-purple-100 mt-2">Franchise Details</p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* {renderField(
                "Website URL",
                company.url,
                <Globe className="h-4 w-4" />,
              )} */}
              {renderField(
                "Industry",
                company.industry,
                <Building2 className="h-4 w-4" />,
              )}
              {renderField("Rank", company.rank, <Award className="h-4 w-4" />)}
              {renderField(
                "Rank Year",
                company.rank_year,
                <Calendar className="h-4 w-4" />,
              )}
              {renderField(
                "Founded",
                company.founded,
                <Calendar className="h-4 w-4" />,
              )}
              {/* {renderField(
                "Image",
                company.image,
                <ExternalLink className="h-4 w-4" />,
              )} */}
            </div>

            <Separator />

            {/* Company Description */}
            {company.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  About the Franchise
                </h3>
                <div className="space-y-2">
                  {company.description
                    .split(". ")
                    .reduce((acc: string[], sentence, index) => {
                      if (index % 2 === 0) {
                        acc.push(sentence + ".");
                      } else {
                        acc[acc.length - 1] += " " + sentence + ".";
                      }
                      return acc;
                    }, [])
                    .map((para, index) => (
                      <p
                        key={index}
                        className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap"
                      >
                        {para.trim()}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Investment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Initial Investment",
                company.initial_investment,
                <DollarSign className="h-4 w-4" />,
              )}
              {renderField(
                "Initial Franchise Fee",
                company.initial_franchise_fee,
                <DollarSign className="h-4 w-4" />,
              )}
              {renderField(
                "Net Worth Requirement",
                company.net_worth_requirement,
                <DollarSign className="h-4 w-4" />,
              )}
              {renderField(
                "Cash Requirement",
                company.cash_requirement,
                <DollarSign className="h-4 w-4" />,
              )}
              {renderField(
                "Royalty Fee",
                company.royalty_fee,
                <DollarSign className="h-4 w-4" />,
              )}
              {renderField(
                "Ad Royalty Fee",
                company.ad_royalty_fee,
                <DollarSign className="h-4 w-4" />,
              )}
            </div>

            <Separator />

            {/* Company Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Parent Company",
                company.parent_company,
                <Building2 className="h-4 w-4" />,
              )}
              {renderField(
                "Leadership",
                company.leadership,
                <Users className="h-4 w-4" />,
              )}
              {renderField(
                "Corporate Address",
                company.corporate_address,
                <MapPin className="h-4 w-4" />,
              )}
              {renderField(
                "Franchising Since",
                company.franchisings_since,
                <Calendar className="h-4 w-4" />,
              )}
              {renderField(
                "Number of Employees at HQ",
                company.num_of_employees_at_hq,
                <Users className="h-4 w-4" />,
              )}
              {renderField(
                "Number of Units",
                company.num_of_units,
                <Building2 className="h-4 w-4" />,
              )}
            </div>

            <Separator />

            {/* Units & Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Units as of 2024",
                company.units_as_of_2024,
                <TrendingUp className="h-4 w-4" />,
              )}
              {renderField(
                "Where Seeking",
                company.where_seeking,
                <Target className="h-4 w-4" />,
              )}
              {renderField(
                "Number of Employees Required to Run",
                company.num_of_employees_required_to_run,
                <Users className="h-4 w-4" />,
              )}
            </div>

            <Separator />

            {/* Franchise Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Term of Agreement",
                company.term_of_agreement,
                <Clock className="h-4 w-4" />,
              )}
              {renderField(
                "Is Franchise Term Renewable",
                company.is_franchise_term_renewable,
                <CheckCircle className="h-4 w-4" />,
              )}
              {renderField(
                "Third Party Financing",
                company.third_party_financing,
                <DollarSign className="h-4 w-4" />,
              )}
              {renderField(
                "In House Financing",
                company.in_house_financing,
                <DollarSign className="h-4 w-4" />,
              )}
            </div>

            <Separator />

            {/* Training & Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "On The Job Training",
                company.on_the_job_training,
                <BookOpen className="h-4 w-4" />,
              )}
              {renderField(
                "Classroom Training",
                company.classroom_training,
                <BookOpen className="h-4 w-4" />,
              )}
              {renderField(
                "Ongoing Support",
                company.ongoing_support,
                <Shield className="h-4 w-4" />,
              )}
              {renderField(
                "Marketing Support",
                company.marketing_support,
                <TrendingUp className="h-4 w-4" />,
              )}
            </div>

            <Separator />

            {/* Operating Flexibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Is Absentee Ownership Allowed",
                company.is_absentee_ownership_allowed,
                <CheckCircle className="h-4 w-4" />,
              )}
              {renderField(
                "Can This Franchise Be Run From Home",
                company.can_this_franchise_be_run_from_home,
                <CheckCircle className="h-4 w-4" />,
              )}
              {renderField(
                "Can This Franchise Be Run Part Time",
                company.can_this_franchise_be_run_part_time,
                <CheckCircle className="h-4 w-4" />,
              )}
              {renderField(
                "Are Exclusive Territories Available",
                company.are_exclusive_territories_available,
                <CheckCircle className="h-4 w-4" />,
              )}
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField(
                "Related Categories",
                company.related_categories,
                <Hash className="h-4 w-4" />,
              )}
              {renderField(
                "Social",
                company.social,
                <ExternalLink className="h-4 w-4" />,
              )}
              {renderField(
                "Veteran Incentives",
                company.veteran_incentives,
                <Award className="h-4 w-4" />,
              )}
            </div>

            {/* Related Franchises */}
            {/* {company.related_franchises && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Related Franchises
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert [&_table]:w-full [&_table]:border-collapse [&_th]:bg-slate-100 [&_th]:p-3 [&_th]:text-left [&_th]:border [&_td]:p-3 [&_td]:border [&_tr:nth-child(even)]:bg-slate-50 [&_a]:text-blue-600 [&_a]:hover:underline"
                    dangerouslySetInnerHTML={{
                      __html: parseRelatedFranchises(
                        company.related_franchises,
                      ),
                    }}
                  />
                </div>
              </div>
            )} */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
