import { Video, Clock, CalendarDays } from "lucide-react";

interface StatsSectionProps {
  totalMovies: number;
  upcomingReminders: number;
  thisWeekCount: number;
}

export default function StatsSection({ totalMovies, upcomingReminders, thisWeekCount }: StatsSectionProps) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Movies</p>
              <p className="text-3xl font-bold text-gray-900" data-testid="text-total-movies">{totalMovies}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Video className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Upcoming Reminders</p>
              <p className="text-3xl font-bold text-gray-900" data-testid="text-upcoming-reminders">{upcomingReminders}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold text-gray-900" data-testid="text-this-week-count">{thisWeekCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CalendarDays className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
