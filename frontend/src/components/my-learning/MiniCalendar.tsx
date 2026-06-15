import { cn } from "./utils";

export function MiniCalendar({ webinars = [] }: { webinars?: any[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = today.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 w-full mt-4">
      <div className="text-center font-display text-lg text-[#600694] mb-4">{monthName} {year}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-sm font-medium">
        {days.map((dayNum, i) => {
          if (!dayNum) return <div key={`empty-${i}`} />;

          const dayWebinars = webinars.filter(w => {
            const schedDate = new Date(w.scheduledFor || w.date);
            return (
              schedDate.getDate() === dayNum &&
              schedDate.getMonth() === month &&
              schedDate.getFullYear() === year
            );
          });

          const hasEvent = dayWebinars.length > 0;
          const isToday = dayNum === today.getDate();

          return (
            <div key={`day-${dayNum}`} className="flex flex-col items-center justify-center relative group">
              <div 
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-full text-gray-600 transition-all duration-200 relative",
                  isToday && "bg-[#600694]/10 text-[#600694] font-bold",
                  hasEvent && "border-2 border-[#600694] text-[#600694] font-semibold bg-white cursor-pointer hover:bg-[#600694] hover:text-white"
                )}
              >
                {dayNum}
                {hasEvent && !isToday && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#600694] rounded-full group-hover:bg-white" />
                )}
              </div>

              {hasEvent && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col w-48 bg-gray-900 text-white text-[11px] rounded-xl p-3 z-30 shadow-xl pointer-events-none">
                  <p className="font-bold border-b border-white/20 pb-1 mb-1 text-purple-300">Scheduled Event:</p>
                  {dayWebinars.map((w, idx) => (
                    <p key={w.id || idx} className="line-clamp-2 leading-snug mt-0.5">
                      • {w.title}
                    </p>
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