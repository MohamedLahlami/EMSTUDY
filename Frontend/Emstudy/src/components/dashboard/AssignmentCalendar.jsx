import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '../ui/Card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const AssignmentCalendar = ({ assignments, materials }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const assignmentEvents = assignments.map(assignment => ({
    date: new Date(assignment.dueDate),
    title: assignment.title,
    type: 'deadline',
    courseId: assignment.courseId,
    id: assignment.id
  }));
  
  const quizEvents = materials
    .filter(material => material.type === 'quiz' || material.type === 'video')
    .map(material => ({
      date: new Date(material.availableFrom),
      title: material.title,
      type: 'quiz',
      courseId: material.courseId,
      id: material.id
    }));
  
  const events = [...assignmentEvents, ...quizEvents];
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const getEventsForDay = (day) => {
    return events.filter(event => isSameDay(event.date, day));
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900">Calendrier</h3>
          <div className="flex items-center">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Mois précédent"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="mx-2 font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Mois suivant"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 p-1" />
          ))}
          
          {daysInMonth.map(day => {
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            
            return (
              <div
                key={day.toString()}
                className={`h-12 p-1 relative border rounded-md ${
                  isToday(day) ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <span 
                  className={`text-sm ${
                    isToday(day) ? 'font-bold text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                
                {hasEvents && (
                  <div className="absolute bottom-1 right-1 flex space-x-1">
                    {dayEvents.some(e => e.type === 'deadline') && (
                      <div className="w-2 h-2 rounded-full bg-red-500" title="Date limite" />
                    )}
                    {dayEvents.some(e => e.type === 'quiz') && (
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Quiz disponible" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Événements:</h4>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">Date limite de devoir</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Quiz/Vidéo disponible</span>
          </div>
        </div>
        
        {events.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Prochains événements:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {events
                .filter(event => event.date >= new Date())
                .sort((a, b) => a.date - b.date)
                .slice(0, 3)
                .map(event => (
                  <div key={`${event.type}-${event.id}`} className="text-xs">
                    <div className="flex items-center">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          event.type === 'deadline' ? 'bg-red-500' : 'bg-green-500'
                        }`} 
                      />
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="ml-4 text-gray-500">
                      {event.type === 'deadline' ? 'À rendre le' : 'Disponible le'} {format(event.date, 'dd/MM/yyyy')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentCalendar; 