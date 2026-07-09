import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "./utils";
import { api } from "@/lib/api";

export function MiniCalendar() {
  // 1. Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // 2. Data State
  const [events, setEvents] = useState<any[]>([]);

  // 3. Mobile Interaction State
  const [activeDay, setActiveDay] = useState<{ num: number, events: any[] } | null>(null);

  // Fetch all events (Satsungs, QnA, Webinars) when component mounts
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const [schedRes, webRes] = await Promise.all([
          api.getSchedules().catch(() => ({ schedules: [] })),
          api.getWebinars().catch(() => ({ webinars: [] }))
        ]);

        const combinedEvents = [
          ...(schedRes.schedules || []),
          ...(webRes.webinars || [])
        ];

        setEvents(combinedEvents);
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
      }
    };

    fetchAllEvents();
  }, []);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const realToday = new Date();

  // Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setActiveDay(null); // Close mobile view on month change
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setActiveDay(null); // Close mobile view on month change
  };

  // Helper to determine the dot color based on event category
  const getEventColor = (category?: string) => {
    if (category === 'QnA') return 'bg-blue-500';
    if (category === 'Satsung') return 'bg-orange-500';
    return 'bg-[#600694]'; // Default/Webinar
  };

  return (
    <div className="bg-gray-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 w-full mt-2 sm:mt-4 shadow-sm">

      {/* HEADER WITH NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 sm:px-2">
        <button
          onClick={handlePrevMonth}
          className="p-1 sm:p-1.5 text-gray-400 hover:text-[#600694] hover:bg-[#600694]/10 rounded-full transition-colors"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="font-display text-base sm:text-lg text-[#600694]">
          {monthName} {year}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 sm:p-1.5 text-gray-400 hover:text-[#600694] hover:bg-[#600694]/10 rounded-full transition-colors"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* DAYS OF THE WEEK */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold text-muted-foreground mb-1.5 sm:mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-y-2 sm:gap-y-3 gap-x-1 text-xs sm:text-sm font-medium">
        {days.map((dayNum, i) => {
          if (!dayNum) return <div key={`empty-${i}`} />;

          const dayEvents = events.filter(e => {
            const schedDate = new Date(e.scheduledFor || e.date);
            return (
              schedDate.getDate() === dayNum &&
              schedDate.getMonth() === month &&
              schedDate.getFullYear() === year
            );
          });

          const hasEvent = dayEvents.length > 0;
          const isRealToday =
            dayNum === realToday.getDate() &&
            month === realToday.getMonth() &&
            year === realToday.getFullYear();

          const isMobileActive = activeDay?.num === dayNum;

          return (
            <div key={`day-${dayNum}`} className="flex flex-col items-center justify-center relative group">
              <div
                onClick={() => {
                  if (hasEvent) setActiveDay(isMobileActive ? null : { num: dayNum, events: dayEvents });
                }}
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-gray-600 transition-all duration-200 relative",
                  isRealToday && "bg-[#600694]/10 text-[#600694] font-bold",
                  hasEvent && "border sm:border-2 border-[#600694] text-[#600694] font-semibold bg-white cursor-pointer hover:bg-[#600694] hover:text-white",
                  isMobileActive && "bg-[#600694] text-white" // Solid background when selected on mobile
                )}
              >
                {dayNum}

                {/* Event Dots Container */}
                {hasEvent && !isRealToday && (
                  <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 flex gap-[1px] sm:gap-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "w-1 h-1 rounded-full group-hover:bg-white transition-colors",
                          getEventColor(e.category),
                          isMobileActive && "bg-white" // Turn dots white if active
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* DESKTOP TOOLTIP: Shows on hover, strictly hidden on mobile */}
              {hasEvent && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden sm:group-hover:flex flex-col w-52 bg-gray-900 text-white text-[11px] rounded-xl p-3 z-30 shadow-xl pointer-events-none">
                  <p className="font-bold border-b border-white/20 pb-1 mb-1 text-purple-300">
                    {monthName} {dayNum} Events:
                  </p>
                  {dayEvents.map((w, idx) => (
                    <div key={w.id || idx} className="mt-1 flex flex-col gap-0.5">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider w-fit px-1.5 rounded",
                        w.category === 'QnA' ? 'bg-blue-500/20 text-blue-300' :
                          w.category === 'Satsung' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-purple-500/20 text-purple-300'
                      )}>
                        {w.category || "Webinar"}
                      </span>
                      <p className="line-clamp-2 leading-snug">
                        {w.title} <span className="opacity-60 text-[9px]">({w.time || new Date(w.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                      </p>
                    </div>
                  ))}
                  <div className="w-2 h-2 bg-gray-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE EVENT VIEWER: Appears below calendar when a date is tapped */}
      {activeDay && activeDay.events.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-purple-100 sm:hidden animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
            <p className="font-bold text-[#600694] text-xs uppercase tracking-wider">
              {monthName} {activeDay.num} Events
            </p>
            <button
              onClick={() => setActiveDay(null)}
              className="p-1 bg-gray-50 rounded-full text-gray-400 hover:text-gray-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {activeDay.events.map((w, idx) => (
              <div key={w.id || idx} className="flex flex-col gap-1 bg-gray-50/50 p-2.5 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                    w.category === 'QnA' ? 'bg-blue-100 text-blue-700' :
                      w.category === 'Satsung' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                  )}>
                    {w.category || "Webinar"}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {w.time || new Date(w.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800 leading-snug mt-1">
                  {w.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}