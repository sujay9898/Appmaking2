import { List, Clock, CalendarDays, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  filterType: string;
  onFilterChange: (filter: string) => void;
}

export default function Sidebar({ filterType, onFilterChange }: SidebarProps) {
  const filters = [
    { id: "all", label: "All Movies", icon: List },
    { id: "upcoming", label: "Upcoming", icon: Clock },
    { id: "this-week", label: "This Week", icon: CalendarDays },
    { id: "past", label: "Past Reminders", icon: History },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-24">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Filters</h3>
        
        <div className="space-y-3">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = filterType === filter.id;
            
            return (
              <Button
                key={filter.id}
                variant="ghost"
                className={`w-full justify-start px-3 py-2 h-auto ${
                  isActive 
                    ? "bg-primary-50 text-primary-700 border border-primary-200 font-medium hover:bg-primary-50" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => onFilterChange(filter.id)}
                data-testid={`button-filter-${filter.id}`}
              >
                <Icon className="mr-2" size={16} />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
