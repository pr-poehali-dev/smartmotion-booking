import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ROOMS = [
  { id: 'orange', name: 'Оранжевое настроение', price: 400, color: 'from-orange-500 to-orange-600' },
  { id: 'salsa', name: 'Salsa', price: 500, color: 'from-pink-500 to-rose-600' },
  { id: 'airlight', name: 'Air&Light', price: 800, color: 'from-cyan-400 to-blue-500' }
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface Booking {
  room_name: string;
  date: string;
  time_slot: string;
}

const Index = () => {
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const { toast } = useToast();

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const fetchBookings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9740880a-0495-4c81-8d54-e9128221b101');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки броней:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const isBooked = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.some(
      booking =>
        booking.room_name === selectedRoom.name &&
        booking.date === dateStr &&
        booking.time_slot === time
    );
  };

  const handleSlotClick = (date: Date, time: string) => {
    if (isBooked(date, time)) return;
    const dateStr = date.toISOString().split('T')[0];
    setSelectedSlot({ date: dateStr, time });
    setIsDialogOpen(true);
  };

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      const response = await fetch('https://functions.poehali.dev/9740880a-0495-4c81-8d54-e9128221b101', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: selectedRoom.name,
          date: selectedSlot.date,
          time_slot: selectedSlot.time
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно!',
          description: 'Время забронировано'
        });
        setIsDialogOpen(false);
        fetchBookings();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.detail || 'Не удалось забронировать',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Проблема с подключением',
        variant: 'destructive'
      });
    }
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${date.toLocaleString('ru', { month: 'short' })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1438] to-[#24243e] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Sparkles" size={32} className="text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              SmartMotion
            </h1>
          </div>
        </header>

        <div className="mb-8 flex gap-4 flex-wrap">
          {ROOMS.map(room => (
            <Button
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`px-6 py-6 text-lg font-semibold transition-all duration-300 ${
                selectedRoom.id === room.id
                  ? `bg-gradient-to-r ${room.color} shadow-lg shadow-purple-500/50 scale-105`
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <div className="flex flex-col items-start">
                <span>{room.name}</span>
                <span className="text-sm font-normal opacity-80">{room.price}₽/час</span>
              </div>
            </Button>
          ))}
        </div>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden animate-fade-in">
          <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-between border-b border-white/10">
            <Button onClick={prevWeek} variant="ghost" size="icon" className="hover:bg-white/10">
              <Icon name="ChevronLeft" size={24} />
            </Button>
            <h2 className="text-xl font-semibold">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </h2>
            <Button onClick={nextWeek} variant="ghost" size="icon" className="hover:bg-white/10">
              <Icon name="ChevronRight" size={24} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="sticky left-0 z-20 bg-white/5 backdrop-blur-sm px-4 py-3 text-left border-r border-white/10 min-w-[100px]">
                    <Icon name="Clock" size={20} />
                  </th>
                  {weekDates.map((date, idx) => (
                    <th key={idx} className="px-4 py-3 text-center border-r border-white/10 min-w-[120px]">
                      <div className="font-semibold">{DAYS_OF_WEEK[idx]}</div>
                      <div className="text-sm opacity-70">{formatDate(date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time) => (
                  <tr key={time} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                    <td className="sticky left-0 z-10 bg-card/80 backdrop-blur-sm px-4 py-3 font-medium border-r border-white/10">
                      {time}
                    </td>
                    {weekDates.map((date, dateIdx) => {
                      const booked = isBooked(date, time);
                      return (
                        <td
                          key={dateIdx}
                          onClick={() => handleSlotClick(date, time)}
                          className={`px-2 py-3 border-r border-white/10 cursor-pointer transition-all duration-200 ${
                            booked
                              ? 'bg-green-500/30 cursor-not-allowed'
                              : 'hover:bg-purple-500/20 hover:scale-105'
                          }`}
                        >
                          <div className="h-12 flex items-center justify-center">
                            {booked ? (
                              <Icon name="Check" size={20} className="text-green-400" />
                            ) : (
                              <Icon name="Plus" size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-6 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500/30 rounded border border-green-500/50"></div>
            <span>Забронировано</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded border border-white/20"></div>
            <span>Свободно</span>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Бронирование
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="space-y-2">
              <Label>Зал</Label>
              <div className={`px-4 py-3 rounded-lg bg-gradient-to-r ${selectedRoom.color} font-semibold`}>
                {selectedRoom.name} — {selectedRoom.price}₽/час
              </div>
            </div>
            <div className="space-y-2">
              <Label>Дата и время</Label>
              <Input
                value={selectedSlot ? `${selectedSlot.date} в ${selectedSlot.time}` : ''}
                disabled
                className="bg-white/10 border-white/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 font-semibold py-6 text-lg"
            >
              Подтвердить бронирование
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;