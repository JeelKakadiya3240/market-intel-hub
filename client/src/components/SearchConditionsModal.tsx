import { useState } from "react";
import { Settings, X, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SearchCondition {
  attribute: string;
  operator: 'or' | 'and';
  sign: 'equals' | 'exactEquals' | 'greater' | 'lower' | 'notEquals';
  values: string[];
}

interface SearchConditionsModalProps {
  onApplyConditions: (conditions: SearchCondition[]) => void;
  currentConditions?: SearchCondition[];
}

const ATTRIBUTE_OPTIONS = [
  { value: 'about.industries', label: 'Industries' },
  { value: 'locations.headquarters.country.code', label: 'Country' },
  { value: 'about.businessType', label: 'Business Type' },
  { value: 'about.totalEmployees', label: 'Total Employees' },
  { value: 'analytics.monthlyVisitors', label: 'Monthly Visitors' },
  { value: 'finances.revenue', label: 'Revenue' },
  { value: 'about.yearFounded', label: 'Year Founded' },
];

const BUSINESS_TYPE_OPTIONS = [
  'educational-institution',
  'government-agencies', 
  'nonprofits',
  'partnerships',
  'privately-held',
  'public-companies',
  'self-employed',
  'sole-proprietorships'
];

const POPULAR_INDUSTRIES = [
  'higher-education',
  'research-services',
  'education',
  'professional-training-and-coaching',
  'academic-calendars',
  'libraries',
  'career-services',
  'student-resources',
  'research',
  'university',
  'technology',
  'healthcare',
  'finance',
  'retail',
  'manufacturing',
  'consulting',
  'real-estate',
  'transportation',
  'energy',
  'media',
  'telecommunications',
  'construction',
  'agriculture',
  'hospitality'
];

const COUNTRY_CODES = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'au', name: 'Australia' },
  { code: 'jp', name: 'Japan' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'cn', name: 'China' }
];

export function SearchConditionsModal({ onApplyConditions, currentConditions = [] }: SearchConditionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conditions, setConditions] = useState<SearchCondition[]>(
    currentConditions.length > 0 ? currentConditions : [
      { attribute: 'about.industries', operator: 'or', sign: 'equals', values: [] }
    ]
  );
  const [currentInputs, setCurrentInputs] = useState<{[key: number]: string}>({});

  const addCondition = () => {
    setConditions([
      ...conditions,
      { attribute: 'about.industries', operator: 'or', sign: 'equals', values: [] }
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof SearchCondition, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    
    // Clear values when attribute changes to prevent type mismatches
    if (field === 'attribute') {
      newConditions[index].values = [];
      setCurrentInputs(prev => ({ ...prev, [index]: '' }));
    }
    
    setConditions(newConditions);
  };

  const updateCurrentInput = (index: number, value: string) => {
    setCurrentInputs(prev => ({ ...prev, [index]: value }));
  };

  const addValueToCondition = (index: number, value: string) => {
    if (value.trim() && !conditions[index].values.includes(value.trim())) {
      const newConditions = [...conditions];
      newConditions[index].values = [...newConditions[index].values, value.trim()];
      setConditions(newConditions);
      setCurrentInputs(prev => ({ ...prev, [index]: '' }));
    }
  };

  const removeValueFromCondition = (conditionIndex: number, valueIndex: number) => {
    const newConditions = [...conditions];
    newConditions[conditionIndex].values = newConditions[conditionIndex].values.filter((_, i) => i !== valueIndex);
    setConditions(newConditions);
  };

  const handleApply = () => {
    const validConditions = conditions.filter(c => c.values.length > 0);
    onApplyConditions(validConditions);
    setIsOpen(false);
  };

  const handleClear = () => {
    setConditions([
      { attribute: 'about.industries', operator: 'or', sign: 'equals', values: [] }
    ]);
    onApplyConditions([]);
  };

  // New options for numeric/range filters
  const TOTAL_EMPLOYEES_OPTIONS = [
    '1-10',
    '10-50', 
    '50-200',
    '200-500',
    '500-1000',
    '1000-5000',
    '5000-10000',
    'over-10000'
  ];

  const MONTHLY_VISITORS_OPTIONS = [
    '10k-50k',
    '50k-100k',
    '100k-500k',
    '500k-1m',
    '1m-10m',
    '10m-50m',
    '50m-100m',
    '100m-500m',
    '500m-1b',
    'over-1b'
  ];

  const REVENUE_OPTIONS = [
    'under-1m',
    '1m-10m',
    '10m-50m',
    '50m-100m',
    '100m-200m',
    '200m-1b',
    'over-1b'
  ];

  const getValueSuggestions = (attribute: string) => {
    switch (attribute) {
      case 'about.businessType':
        return BUSINESS_TYPE_OPTIONS;
      case 'about.industries':
        return POPULAR_INDUSTRIES;
      case 'locations.headquarters.country.code':
        return COUNTRY_CODES.map(c => c.code);
      case 'about.totalEmployees':
        return TOTAL_EMPLOYEES_OPTIONS;
      case 'analytics.monthlyVisitors':
        return MONTHLY_VISITORS_OPTIONS;
      case 'finances.revenue':
        return REVENUE_OPTIONS;
      default:
        return [];
    }
  };

  const getAttributeLabel = (attribute: string) => {
    return ATTRIBUTE_OPTIONS.find(opt => opt.value === attribute)?.label || attribute;
  };

  const getDisplayValue = (attribute: string, value: string) => {
    switch (attribute) {
      case 'about.businessType':
        return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      case 'about.totalEmployees':
        return value === 'over-10000' ? 'Over 10,000' : value.replace('-', ' - ');
      case 'analytics.monthlyVisitors':
        return value === 'over-1b' ? 'Over 1B' : value.toUpperCase().replace('-', ' - ');
      case 'finances.revenue':
        const revenueMap: {[key: string]: string} = {
          'under-1m': 'Under $1 Million',
          '1m-10m': '$1 Million - $10 Million', 
          '10m-50m': '$10 Million - $50 Million',
          '50m-100m': '$50 Million - $100 Million',
          '100m-200m': '$100 Million - $200 Million',
          '200m-1b': '$200 Million - $1 Billion',
          'over-1b': 'Over $1 Billion'
        };
        return revenueMap[value] || value;
      default:
        return value;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <Settings className="h-4 w-4" />
          Conditions
          {currentConditions.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {currentConditions.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Search Conditions
          </DialogTitle>
          <DialogDescription>
            Set specific filters for companies based on industries, location, business type, and other attributes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {conditions.map((condition, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">
                  Condition {index + 1}
                </Label>
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Attribute</Label>
                  <Select
                    value={condition.attribute}
                    onValueChange={(value) => updateCondition(index, 'attribute', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ATTRIBUTE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value: 'or' | 'and') => updateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="or">OR (any match)</SelectItem>
                      <SelectItem value="and">AND (all match)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Condition</Label>
                  <Select
                    value={condition.sign}
                    onValueChange={(value: 'equals' | 'notEquals') => 
                      updateCondition(index, 'sign', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="notEquals">Not Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                {/* Quick suggestions */}
                {getValueSuggestions(condition.attribute).length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {getValueSuggestions(condition.attribute).slice(0, 8).map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addValueToCondition(index, suggestion)}
                          disabled={condition.values.includes(suggestion)}
                        >
                          {condition.attribute === 'locations.headquarters.country.code' 
                            ? COUNTRY_CODES.find(c => c.code === suggestion)?.name || suggestion
                            : getDisplayValue(condition.attribute, suggestion)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom input - only for certain fields */}
                {!['about.totalEmployees', 'analytics.monthlyVisitors', 'finances.revenue'].includes(condition.attribute) && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentInputs[index] || ''}
                      onChange={(e) => updateCurrentInput(index, e.target.value)}
                      placeholder={`Add ${getAttributeLabel(condition.attribute).toLowerCase()}...`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addValueToCondition(index, currentInputs[index] || '');
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentInputs[index]) {
                          addValueToCondition(index, currentInputs[index]);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Current values */}
                <div className="flex flex-wrap gap-1">
                  {condition.values.map((value, valueIndex) => (
                    <Badge key={valueIndex} variant="secondary" className="flex items-center gap-1">
                      {condition.attribute === 'locations.headquarters.country.code' 
                        ? COUNTRY_CODES.find(c => c.code === value)?.name || value
                        : getDisplayValue(condition.attribute, value)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 p-0 hover:bg-red-100"
                        onClick={() => removeValueFromCondition(index, valueIndex)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addCondition}
            className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Condition
          </Button>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
              Apply Conditions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}