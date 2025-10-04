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
  Calendar,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Target,
  Briefcase,
  Clock,
} from "lucide-react";
import { CompanyVc } from "@/types/database";

// Add custom CSS for table styling
const tableStyles = `
  .funds-table table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
  }
  .funds-table th, .funds-table td {
    padding: 8px 12px;
    text-align: left;
    border: 1px solid #e2e8f0;
    font-size: 12px;
    line-height: 1.4;
  }
  .funds-table th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #475569;
  }
  .funds-table td {
    background-color: #ffffff;
    color: #334155;
  }
  .funds-table tr:nth-child(even) td {
    background-color: #f8fafc;
  }
`;

interface VcDetailDialogProps {
  company: CompanyVc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VcDetailDialog({
  company,
  open,
  onOpenChange,
}: VcDetailDialogProps) {
  if (!company) return null;

  console.log("🟩 VC Company:", company);

  const getCompanyImage = (company: CompanyVc) => {
    if (company.image && company.image !== "-") {
      return `https://kluqlibhlkcsuighyczd.supabase.co/storage/v1/object/public/companies/VC/${company.image}`;
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

  // Colorful professional field renderer
  const renderDetailField = (label: string, value: any, icon?: React.ReactNode, iconColor?: string) => {
    if (!value || value === "-" || value === "N/A" || value === "null") return null;

    const getIconBgColor = (color?: string) => {
      switch (color) {
        case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
        case 'green': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
        case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
        case 'orange': return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300';
        case 'teal': return 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300';
        default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      }
    };

    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          {icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBgColor(iconColor)}`}>
              {icon}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="text-base text-gray-900 dark:text-white font-medium leading-relaxed ml-11">
          {value}
        </div>
      </div>
    );
  };

  // Colorful investment focus with badges
  const renderInvestmentFocus = () => {
    if (!company.industry && !company.regionOfInvestment) return null;
    
    const industries = company.industry ? company.industry.split(',').map(i => i.trim()) : [];
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-indigo-100 text-indigo-800', 'bg-pink-100 text-pink-800'];
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center">
            <Target className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Investment Focus
          </span>
        </div>
        <div className="ml-11 space-y-3">
          {industries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {industries.map((industry, index) => (
                <span 
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[index % colors.length]} border shadow-sm`}
                >
                  {industry}
                </span>
              ))}
            </div>
          )}
          {company.regionOfInvestment && (
            <div className="text-base text-gray-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
              📍 {company.regionOfInvestment}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Colorful strategy renderer with badges
  const renderStrategy = () => {
    if (!company.investmentStage && !company.investmentHorizon && !company.exitStrategy) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Strategy
          </span>
        </div>
        <div className="ml-11 space-y-3">
          {company.investmentStage && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <span className="text-blue-700 dark:text-blue-300 font-semibold">Investment stage: </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-600 text-white ml-2">
                {company.investmentStage}
              </span>
            </div>
          )}
          {company.investmentHorizon && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <span className="text-green-700 dark:text-green-300 font-medium">⏱️ {company.investmentHorizon}</span>
            </div>
          )}
          {company.exitStrategy && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <span className="text-orange-700 dark:text-orange-300 font-medium">🚀 Exit via {company.exitStrategy}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{tableStyles}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
          {/* Colorful Professional Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg text-white flex items-center justify-center font-bold text-lg border border-white/30 shadow-lg overflow-hidden">
                {getCompanyImage(company) ? (
                  <img
                    src={getCompanyImage(company)!}
                    alt={company.title || "VC Company"}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextSibling) {
                        (target.nextSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ display: getCompanyImage(company) ? 'none' : 'flex' }}
                >
                  {(company.title || "VC")?.charAt(0) || "V"}
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {company.title || "VC Company"}
                </DialogTitle>
                <p className="text-indigo-100 mt-1">Venture Capital Investment Profile</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Colorful Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column - Company Details */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200/50 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Company Details
                    </h2>
                  </div>
                  <div>
                    {renderDetailField(
                      "Location",
                      company.location,
                      <MapPin className="h-4 w-4" />,
                      "green"
                    )}
                    {renderDetailField(
                      "Founded",
                      company.founded,
                      <Calendar className="h-4 w-4" />,
                      "purple"
                    )}
                    {renderDetailField(
                      "Investment Overview",
                      company.investmentStage,
                      <TrendingUp className="h-4 w-4" />,
                      "orange"
                    )}
                    {renderInvestmentFocus()}
                  </div>
                </div>

                {/* Right Column - Investment Details */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-200/50 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Investment Details
                    </h2>
                  </div>
                  <div>
                    {renderDetailField(
                      "Investment Target Size",
                      company.investmentTicket,
                      <Target className="h-4 w-4" />,
                      "teal"
                    )}
                    {renderStrategy()}
                  </div>
                </div>
              </div>

              {/* Colorful Profile Section */}
              {company.profile && (
                <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Profile
                    </h2>
                  </div>
                  <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 text-base text-gray-700 dark:text-gray-300 leading-relaxed border border-emerald-200/50 dark:border-emerald-800/50">
                    {cleanText(company.profile)}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
