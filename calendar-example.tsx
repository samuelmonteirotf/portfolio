"use client"

interface Appointment {
  id: string
  title: string
  startTime: string
  endTime: string
  startHour: number
  duration: number
}

const appointments: Appointment[] = [
  {
    id: "1",
    title: "Weekly Meeting",
    startTime: "09:00",
    endTime: "10:00",
    startHour: 9,
    duration: 1,
  },
  {
    id: "2",
    title: "Preview sobre o novo design",
    startTime: "10:00",
    endTime: "11:00",
    startHour: 10,
    duration: 1,
  },
  {
    id: "3",
    title: "Entrevista",
    startTime: "11:00",
    endTime: "12:00",
    startHour: 11,
    duration: 1,
  },
]

export default function CalendarExample() {
  return (
    <div className="max-w-md mx-auto bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 p-4 text-center">
        <div className="text-2xl font-bold">Thu</div>
        <div className="text-4xl font-bold">1</div>
        <div className="text-sm text-gray-600">GMT-03</div>
      </div>

      {/* Calendar Body */}
      <div className="relative h-96 bg-gray-50">
        {/* Time Grid */}
        {Array.from({ length: 8 }, (_, i) => i + 8).map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-200 text-xs text-gray-500 pl-2"
            style={{ top: `${(hour - 8) * 48}px`, height: "48px" }}
          >
            {hour.toString().padStart(2, "0")}:00
          </div>
        ))}

        {/* Appointments */}
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="absolute left-12 right-2 bg-blue-600 text-white text-sm p-2 rounded shadow-sm"
            style={{
              top: `${(appointment.startHour - 8) * 48 + 2}px`,
              height: `${appointment.duration * 48 - 4}px`,
            }}
          >
            <div className="font-medium">{appointment.title}</div>
            <div className="text-xs opacity-90">
              {appointment.startTime} - {appointment.endTime}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
