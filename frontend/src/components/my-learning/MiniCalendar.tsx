import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { api } from "@/lib/api";

export function MiniCalendar() {
  // 1. Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 2. Data State
  const [events, setEvents] = useState<any[]>([]);

  // 3. Fetch all events (Satsungs, QnA, Webinars) when component mounts
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        // Fetch both schedules and webinars in parallel
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

  // 4. Calendar Math based on the CURRENT viewed month, not just 'today'
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Real 'today' for highlighting the current actual day
  const realToday = new Date();

  // Navigation Handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to determine the dot color based on event category
  const getEventColor = (category?: string) => {
    if (category === 'QnA') return 'bg-blue-500';
    if (category === 'Satsung') return 'bg-orange-500';
    return 'bg-[#600694]'; // Default/Webinar
  };

  return (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 w-full mt-4 shadow-sm">
      
      {/* 🚨 HEADER WITH NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button 
          onClick={handlePrevMonth}
          className="p-1.5 text-gray-400 hover:text-[#600694] hover:bg-[#600694]/10 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="font-display text-lg text-[#600694]">
          {monthName} {year}
        </div>
        <button 
          onClick={handleNextMonth}
          className="p-1.5 text-gray-400 hover:text-[#600694] hover:bg-[#600694]/10 rounded-full transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* DAYS OF THE WEEK */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-sm font-medium">
        {days.map((dayNum, i) => {
          if (!dayNum) return <div key={`empty-${i}`} />;

          // Find all events that land on this specific calendar day
          const dayEvents = events.filter(e => {
            // Note: Webinars use 'scheduledFor', Schedules use 'date'
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

          return (
            <div key={`day-${dayNum}`} className="flex flex-col items-center justify-center relative group">
              <div 
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-full text-gray-600 transition-all duration-200 relative",
                  isRealToday && "bg-[#600694]/10 text-[#600694] font-bold",
                  hasEvent && "border-2 border-[#600694] text-[#600694] font-semibold bg-white cursor-pointer hover:bg-[#600694] hover:text-white"
                )}
              >
                {dayNum}
                
                {/* Event Dots Container */}
                {hasEvent && !isRealToday && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {/* Show up to 3 dots if there are multiple events on the same day */}
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span 
                        key={idx} 
                        className={cn("w-1 h-1 rounded-full group-hover:bg-white", getEventColor(e.category))} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* TOOLTIP ON HOVER */}
              {hasEvent && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col w-52 bg-gray-900 text-white text-[11px] rounded-xl p-3 z-30 shadow-xl pointer-events-none">
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
                        {w.title} <span className="opacity-60 text-[9px]">({w.time || new Date(w.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
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
    </div>
  );
}