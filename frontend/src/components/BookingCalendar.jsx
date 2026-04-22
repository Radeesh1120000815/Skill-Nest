import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function BookingCalendar({ myBookings }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const bookingsByDate = useMemo(() => {
    const map = {};
    myBookings.forEach((b) => {
      const d = new Date(b.sessionId?.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [myBookings]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="p-6 space-y-6">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-3xl font-black">
          {MONTHS[month]} {year}
        </h2>
        <p className="text-sm opacity-80">Your cute booking calendar 💖</p>
      </div>

      {/* NAV */}
      <div className="flex justify-between items-center">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2 bg-white rounded-xl shadow hover:scale-110 transition">
          <ChevronLeft />
        </button>

        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 bg-white rounded-xl shadow hover:scale-110 transition">
          <ChevronRight />
        </button>
      </div>

      {/* CALENDAR */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        
        {/* DAYS */}
        <div className="grid grid-cols-7 bg-gray-50 text-gray-500 text-xs font-bold">
          {DAYS.map(d => (
            <div key={d} className="text-center py-3">{d}</div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={i} className="h-20 bg-gray-50" />;
            }

            const key = `${year}-${month}-${day}`;
            const hasBooking = bookingsByDate[key];

            return (
              <div key={day}
                className="h-20 border p-2 hover:bg-purple-50 cursor-pointer transition rounded-xl">

                <div className="font-bold text-gray-700">{day}</div>

                {/* cute dots */}
                <div className="flex gap-1 mt-2">
                  {hasBooking &&
                    hasBooking.slice(0, 3).map((_, i) => (
                      <div key={i}
                        className="w-2 h-2 bg-pink-400 rounded-full" />
                    ))}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}