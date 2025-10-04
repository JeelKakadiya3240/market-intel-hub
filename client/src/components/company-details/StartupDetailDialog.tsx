import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  Trophy,
  Share2,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Hash,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompanyStartup } from "@/types/database";

interface StartupDetailDialogProps {
  company: CompanyStartup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartupDetailDialog({
  company,
  open,
  onOpenChange,
}: StartupDetailDialogProps) {
  if (!company) return null;

  const getCompanyImage = (company: CompanyStartup) => {
    if (company.image && company.image !== "-") {
      return `https://kluqlibhlkcsuighyczd.supabase.co/storage/v1/object/public/companies/Startups/${company.image}`;
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

  const formatSocialCount = (count: string | number | null | undefined) => {
    if (!count || count === "-" || count === "N/A") return "N/A";
    const numCount =
      typeof count === "string" ? parseInt(count.replace(/,/g, "")) : count;
    if (isNaN(numCount)) return "N/A";
    if (numCount >= 1000000) return `${(numCount / 1000000).toFixed(1)}M`;
    if (numCount >= 1000) return `${(numCount / 1000).toFixed(1)}K`;
    return numCount.toString();
  };

  const renderField = (label: string, value: any, icon?: React.ReactNode, colorScheme?: string) => {
    if (!value || value === "-" || value === "N/A" || value === "null")
      return null;

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

  const renderTableContent = (
    htmlContent: string | null | undefined,
    title: string,
    icon: React.ReactNode,
  ) => {
    if (
      !htmlContent ||
      htmlContent.includes("There are no") ||
      htmlContent === "-" ||
      htmlContent === "N/A" ||
      htmlContent === "null"
    ) {
      return null;
    }
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {icon}
          </div>
          <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
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

  // Helper to strip competitor names/links from HTML but keep images
  function stripCompetitorNames(html: string): string {
    // Remove <a ...>...</a> tags (which usually wrap the name)
    // Keep <img> tags and any other content
    // This regex removes <a ...>...</a> but leaves images and other tags
    return html.replace(/<a [^>]*>.*?<\/a>/gis, (match) => {
      // If the <a> contains an <img>, keep the <img> only
      const imgMatch = match.match(/<img [^>]*>/i);
      return imgMatch ? imgMatch[0] : "";
    });
  }

  // Helper to strip competitor links but keep names as plain text (not links)
  function stripCompetitorLinks(html: string): string {
    // Replace <a ...>...</a> with just the inner text (company name)
    return html.replace(/<a [^>]*>(.*?)<\/a>/gis, "$1");
  }

  // Helper to strip team member names/links from HTML but keep images
  function stripTeamMemberNames(html: string): string {
    // Remove <a ...>...</a> tags (which usually wrap the name)
    // Keep <img> tags and any other content
    return html.replace(/<a [^>]*>.*?<\/a>/gis, (match) => {
      const imgMatch = match.match(/<img [^>]*>/i);
      return imgMatch ? imgMatch[0] : "";
    });
  }

  // Helper to strip product names/links from HTML but keep images
  function stripProductNames(html: string): string {
    // Remove <a ...>...</a> tags (which usually wrap the name)
    // Keep <img> tags and any other content
    return html.replace(/<a [^>]*>.*?<\/a>/gis, (match) => {
      const imgMatch = match.match(/<img [^>]*>/i);
      return imgMatch ? imgMatch[0] : "";
    });
  }

  // Helper to strip links but keep names as plain text (not links) for Products and Team Members
  function stripLinksKeepNames(html: string): string {
    // Replace <a ...>...</a> with just the inner text (name)
    return html.replace(/<a [^>]*>(.*?)<\/a>/gis, "$1");
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {company.name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {company.name || "Unnamed Startup"}
              </DialogTitle>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Startup
                </span>
                {company.rank && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <Trophy className="w-4 h-4 mr-1" />
                    Rank #{company.rank}
                  </span>
                )}
                {company.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Building2 className="w-4 h-4 mr-1" />
                    {company.category}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-slate-600 dark:text-slate-400">
                {company.country && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.country}{company.state && `, ${company.state}`}
                  </p>
                )}
                {company.founded && (
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Founded {company.founded}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-8 py-6">
          <div className="space-y-8">
            {/* Company Overview */}
            {(company.short_description || company.long_description) && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  About {company.name}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                  {cleanText(company.short_description || company.long_description)}
                </p>
              </div>
            )}

            {/* Company Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Company Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {company.website && renderField(
                  "Website",
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {company.website} <ExternalLink className="h-3 w-3" />
                  </a>,
                  <Globe className="h-4 w-4" />,
                  "blue"
                )}
                {renderField("Category", company.category, <Building2 className="h-4 w-4" />, "purple")}
                {renderField("Subcategory", company.sub_category, <Tag className="h-4 w-4" />, "green")}
                {renderField("Size", company.size, <Users className="h-4 w-4" />, "orange")}
              </div>
            </div>

            {/* Descriptions */}
            {(company.short_description || company.long_description) && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.short_description && (
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">
                        Short Description
                      </h5>
                      <p className="text-slate-600 dark:text-white leading-relaxed">
                        {cleanText(company.short_description)}
                      </p>
                    </div>
                  )}
                  {company.long_description && (
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">
                        Long Description
                      </h5>
                      <p className="text-slate-600 dark:text-white leading-relaxed">
                        {cleanText(company.long_description)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rankings & Scores */}
            {(company.rank ||
              company.sr_score2 ||
              company.sr_web ||
              company.sr_social) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Rankings & Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {company.rank && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                        <div className="text-xs text-yellow-600 font-medium">
                          Global Rank
                        </div>
                        <div className="text-2xl font-bold text-yellow-900">
                          #{company.rank}
                        </div>
                      </div>
                    )}
                    {company.sr_score2 && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <div className="text-xs text-blue-600 font-medium">
                          Prognosticz Score
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {company.sr_score2}
                        </div>
                      </div>
                    )}
                    {company.sr_web && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <div className="text-xs text-green-600 font-medium">
                          Web Score
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {company.sr_web}
                        </div>
                      </div>
                    )}
                    {company.sr_social && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-600 font-medium">
                          Social Score
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {company.sr_social}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEO Authority Metrics */}
            {(company.moz_domain_auth || company.moz_page_auth) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    SEO Authority Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.moz_domain_auth && (
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                        <div className="text-xs text-indigo-600 font-medium">
                          Moz Domain Authority
                        </div>
                        <div className="text-2xl font-bold text-indigo-900">
                          {company.moz_domain_auth}
                        </div>
                      </div>
                    )}
                    {company.moz_page_auth && (
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                        <div className="text-xs text-teal-600 font-medium">
                          Moz Page Authority
                        </div>
                        <div className="text-2xl font-bold text-teal-900">
                          {company.moz_page_auth}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media Presence */}
            {(company.facebook ||
              company.twitter ||
              company.linkedin ||
              company.facebook_fans ||
              company.facebook_engagement ||
              company.twitter_followers ||
              company.twitter_engagement) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Social Media Presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Social Links */}
                  {(company.facebook ||
                    company.twitter ||
                    company.linkedin) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {company.facebook && (
                        <a
                          href={company.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Facebook className="h-6 w-6 text-blue-600" />
                          <div>
                            <div className="font-medium">Facebook</div>
                            <div className="text-sm text-slate-600">
                              {formatSocialCount(company.facebook_fans)} fans
                            </div>
                          </div>
                        </a>
                      )}
                      {company.twitter && (
                        <a
                          href={company.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Twitter className="h-6 w-6 text-blue-500" />
                          <div>
                            <div className="font-medium">Twitter</div>
                            <div className="text-sm text-slate-600">
                              {formatSocialCount(company.twitter_followers)}{" "}
                              followers
                            </div>
                          </div>
                        </a>
                      )}
                      {company.linkedin && (
                        <a
                          href={company.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Linkedin className="h-6 w-6 text-blue-700" />
                          <div>
                            <div className="font-medium">LinkedIn</div>
                            <div className="text-sm text-slate-600">
                              Company Page
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Social Metrics */}
                  {(company.facebook_fans ||
                    company.facebook_engagement ||
                    company.twitter_followers ||
                    company.twitter_engagement) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {company.facebook_fans && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium">
                            Facebook Fans
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatSocialCount(company.facebook_fans)}
                          </div>
                        </div>
                      )}
                      {company.facebook_engagement && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium">
                            Facebook Engagement
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatSocialCount(company.facebook_engagement)}
                          </div>
                        </div>
                      )}
                      {company.twitter_followers && (
                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-200">
                          <div className="text-xs text-sky-600 font-medium">
                            Twitter Followers
                          </div>
                          <div className="text-2xl font-bold text-sky-900">
                            {formatSocialCount(company.twitter_followers)}
                          </div>
                        </div>
                      )}
                      {company.twitter_engagement && (
                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-200">
                          <div className="text-xs text-sky-600 font-medium">
                            Twitter Engagement
                          </div>
                          <div className="text-2xl font-bold text-sky-900">
                            {formatSocialCount(company.twitter_engagement)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {company.tags && company.tags !== "[]" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.tags
                      .replace(/[\[\]']/g, "")
                      .split(",")
                      .map(
                        (tag, index) =>
                          tag.trim() && (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.trim()}
                            </Badge>
                          ),
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Record Information */}
            {/* {(company.created_at || company.updated_at) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Record Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                      "Created At",
                      company.created_at
                        ? new Date(company.created_at).toLocaleString()
                        : null,
                      <Calendar className="h-4 w-4" />,
                    )}
                    {renderField(
                      "Updated At",
                      company.updated_at
                        ? new Date(company.updated_at).toLocaleString()
                        : null,
                      <Calendar className="h-4 w-4" />,
                    )}
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Competitors */}
            {renderTableContent(
              company.competitors_table
                ? stripCompetitorLinks(company.competitors_table)
                : company.competitors_table,
              "Competitors",
              <Users className="h-5 w-5" />,
            )}
            {renderTableContent(
              company.funding_table,
              "Funding Rounds",
              <Building2 className="h-5 w-5" />,
            )}
            {renderTableContent(
              company.acquisitions_table,
              "Acquisitions",
              <Building2 className="h-5 w-5" />,
            )}
            {renderTableContent(
              company.products_table
                ? stripLinksKeepNames(company.products_table)
                : company.products_table,
              "Products",
              <Building2 className="h-5 w-5" />,
            )}
            {renderTableContent(
              company.team_table
                ? stripLinksKeepNames(company.team_table)
                : company.team_table,
              "Team Members",
              <Building2 className="h-5 w-5" />,
            )}
            {renderTableContent(
              company.news_table,
              "News & Articles",
              <Building2 className="h-5 w-5" />,
            )}
            {renderTableContent(
              company.statistics_table,
              "Statistics",
              <Building2 className="h-5 w-5" />,
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
                              