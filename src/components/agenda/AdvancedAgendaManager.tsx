'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Edit3,
  Move,
  Lock,
  Unlock,
  RefreshCw,
  Filter,
  Plus,
  MoreVertical,
  Phone,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  blocked?: boolean;
  reason?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'present' | 'absent';
  type: string;
  notes?: string;
  phone?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  color: string;
  workingHours: {
    start: string;
    end: string;
    days: number[]; // 0-6 (domingo-sábado)
  };
  unavailableDates?: string[];
}

const AdvancedAgendaManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados do Supabase
  useEffect(() => {
    fetchProfessionals();
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          id,
          specialty,
          working_hours,
          users!inner(full_name)
        `);

      if (error) throw error;

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
      const professionalData: Professional[] = data?.map((prof: any, index) => ({
        id: prof.id.toString(),
        name: prof.users?.full_name || 'Nome não disponível',
        specialty: prof.specialty || 'Psicologia',
        color: colors[index % colors.length],
        workingHours: prof.working_hours || {
          start: '08:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5]
        }
      })) || [];

      setProfessionals(professionalData);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          patient:patients!inner(
            id,
            user:users!inner(full_name, phone)
          ),
          professional:professionals!inner(
            id,
            users!inner(full_name)
          )
        `)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`);

      if (error) throw error;

      const appointmentData: Appointment[] = data?.map((apt: any) => {
        const startTime = new Date(apt.start_time);
        const endTime = new Date(apt.end_time);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        return {
          id: apt.id.toString(),
          patientId: apt.patient?.id?.toString() || '',
          patientName: apt.patient?.user?.full_name || 'Nome não disponível',
          professionalId: apt.professional?.id?.toString() || '',
          professionalName: apt.professional?.users?.full_name || 'Profissional não disponível',
          date: dateStr,
          startTime: startTime.toTimeString().slice(0, 5),
          endTime: endTime.toTimeString().slice(0, 5),
          duration,
          status: apt.status as any,
          type: 'Consulta',
          notes: apt.notes,
          phone: apt.patient?.user?.phone,
          value: 200, // Valor padrão
          createdAt: apt.start_time,
          updatedAt: apt.start_time
        };
      }) || [];

      setAppointments(appointmentData);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // Gerar horários disponíveis para o dia selecionado
  const generateTimeSlots = useCallback((professional: Professional, date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();
    
    // Verificar se o profissional trabalha neste dia
    if (!professional.workingHours.days.includes(dayOfWeek)) {
      return slots;
    }

    const startHour = parseInt(professional.workingHours.start.split(':')[0]);
    const endHour = parseInt(professional.workingHours.end.split(':')[0]);
    const dateStr = date.toISOString().split('T')[0];

    // Verificar se é data indisponível
    const isUnavailableDate = professional.unavailableDates?.includes(dateStr);

    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const slotId = `${professional.id}-${dateStr}-${timeSlot}`;
      
      // Verificar se já existe agendamento neste horário
      const hasAppointment = appointments.some(apt => 
        apt.professionalId === professional.id &&
        apt.date === dateStr &&
        apt.startTime === timeSlot &&
        apt.status !== 'cancelled'
      );

      slots.push({
        id: slotId,
        start: timeSlot,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        available: !hasAppointment && !isUnavailableDate && !blockedSlots.includes(slotId),
        blocked: blockedSlots.includes(slotId) || isUnavailableDate,
        reason: isUnavailableDate ? 'Data indisponível' : blockedSlots.includes(slotId) ? 'Horário bloqueado' : undefined
      });
    }

    return slots;
  }, [appointments, blockedSlots]);

  // Filtrar agendamentos do dia selecionado
  const getDayAppointments = useCallback(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const matchesDate = apt.date === dateStr;
      const matchesProfessional = selectedProfessional === 'all' || apt.professionalId === selectedProfessional;
      return matchesDate && matchesProfessional;
    });
  }, [appointments, selectedDate, selectedProfessional]);

  // Handlers para drag and drop
  const handleDragStart = (appointment: Appointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setHoveredSlot(slotId);
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleDrop = async (e: React.DragEvent, slotId: string, newTime: string, professionalId: string) => {
    e.preventDefault();
    setHoveredSlot(null);

    if (!draggedAppointment) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const newEndTime = calculateEndTime(newTime, draggedAppointment.duration);

    try {
      setIsLoading(true);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setAppointments(prev => prev.map(apt => 
        apt.id === draggedAppointment.id
          ? {
              ...apt,
              date: dateStr,
              startTime: newTime,
              endTime: newEndTime,
              professionalId,
              professionalName: professionals.find(p => p.id === professionalId)?.name || apt.professionalName,
              updatedAt: new Date().toISOString()
            }
          : apt
      ));

      setDraggedAppointment(null);
    } catch (error) {
      console.error('Erro ao reagendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular horário de fim baseado na duração
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Bloquear/desbloquear horário
  const toggleSlotBlock = (slotId: string) => {
    setBlockedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  // Registrar presença/ausência
  const markAttendance = async (appointmentId: string, status: 'present' | 'absent' | 'no_show') => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId
          ? { ...apt, status, updatedAt: new Date().toISOString() }
          : apt
      ));

      setShowAttendanceModal(null);
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obter estatísticas do dia
  const getDayStats = () => {
    const dayAppointments = getDayAppointments();
    return {
      total: dayAppointments.length,
      confirmed: dayAppointments.filter(apt => apt.status === 'confirmed').length,
      present: dayAppointments.filter(apt => apt.status === 'present').length,
      absent: dayAppointments.filter(apt => ['absent', 'no_show'].includes(apt.status)).length,
      pending: dayAppointments.filter(apt => apt.status === 'scheduled').length
    };
  };

  const stats = getDayStats();

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      present: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      present: 'Presente',
      completed: 'Realizado',
      absent: 'Ausente',
      no_show: 'Faltou',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Avançada</h1>
          <p className="text-gray-600 mt-1">
            Sistema completo com drag-and-drop, bloqueio de horários e controle de presença
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os profissionais</option>
            {professionals.map(prof => (
              <option key={prof.id} value={prof.id}>
                {prof.name} - {prof.specialty}
              </option>
            ))}
          </select>
          
          <Button onClick={() => window.location.reload()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Estatísticas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmados</p>
                <p className="text-xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Presentes</p>
                <p className="text-xl font-bold">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ausentes</p>
                <p className="text-xl font-bold">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade de horários por profissional */}
      <div className="grid gap-6">
        {(selectedProfessional === 'all' ? professionals : professionals.filter(p => p.id === selectedProfessional)).map(professional => {
          const timeSlots = generateTimeSlots(professional, selectedDate);
          const professionalAppointments = getDayAppointments().filter(apt => apt.professionalId === professional.id);

          return (
            <Card key={professional.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: professional.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">{professional.name}</CardTitle>
                      <p className="text-sm text-gray-600">{professional.specialty}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {professional.workingHours.start} - {professional.workingHours.end}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  {timeSlots.map(slot => {
                    const appointment = professionalAppointments.find(apt => apt.startTime === slot.start);
                    const isHovered = hoveredSlot === slot.id;
                    
                    return (
                      <div
                        key={slot.id}
                        className={`
                          relative min-h-[80px] border-2 rounded-lg p-2 transition-all duration-200
                          ${appointment ? 'cursor-move' : slot.available ? 'cursor-pointer border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50' : ''}
                          ${slot.blocked ? 'bg-gray-100 border-gray-200' : ''}
                          ${isHovered ? 'border-blue-500 bg-blue-50' : ''}
                        `}
                        onDragOver={(e) => slot.available && !appointment && handleDragOver(e, slot.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => slot.available && !appointment && handleDrop(e, slot.id, slot.start, professional.id)}
                      >
                        {/* Horário */}
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {slot.start}
                        </div>

                        {/* Agendamento */}
                        {appointment && (
                          <div
                            draggable
                            onDragStart={() => handleDragStart(appointment)}
                            className={`
                              absolute inset-1 rounded-md p-2 border text-xs
                              ${getStatusColor(appointment.status)}
                              hover:shadow-md cursor-move
                            `}
                          >
                            <div className="font-medium truncate">{appointment.patientName}</div>
                            <div className="text-xs opacity-75 truncate">{appointment.type}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-medium">
                                {getStatusLabel(appointment.status)}
                              </span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => setShowAttendanceModal(appointment)}
                                  className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                                  title="Registrar presença"
                                >
                                  <UserCheck className="h-3 w-3" />
                                </button>
                                <button
                                  className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                                  title="Mais opções"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Slot vazio */}
                        {!appointment && slot.available && (
                          <div className="text-center text-gray-400 text-xs mt-4">
                            <Plus className="h-4 w-4 mx-auto mb-1" />
                            Disponível
                          </div>
                        )}

                        {/* Slot bloqueado */}
                        {slot.blocked && (
                          <div className="text-center text-gray-500 text-xs mt-2">
                            <Lock className="h-4 w-4 mx-auto mb-1" />
                            {slot.reason || 'Bloqueado'}
                          </div>
                        )}

                        {/* Botão de bloqueio */}
                        {!appointment && (
                          <button
                            onClick={() => toggleSlotBlock(slot.id)}
                            className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title={slot.blocked ? 'Desbloquear horário' : 'Bloquear horário'}
                          >
                            {slot.blocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de registro de presença */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Registrar Presença</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{showAttendanceModal.patientName}</p>
                <p className="text-sm text-gray-600">
                  {showAttendanceModal.startTime} - {showAttendanceModal.endTime}
                </p>
                <p className="text-sm text-gray-600">{showAttendanceModal.type}</p>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Selecione o status da consulta:
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => markAttendance(showAttendanceModal.id, 'present')}
                  disabled={isLoading}
                  className="flex flex-col items-center py-4 h-auto space-y-2 border-green-200 hover:bg-green-50"
                >
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-xs">Presente</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => markAttendance(showAttendanceModal.id, 'absent')}
                  disabled={isLoading}
                  className="flex flex-col items-center py-4 h-auto space-y-2 border-yellow-200 hover:bg-yellow-50"
                >
                  <UserX className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs">Ausente</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => markAttendance(showAttendanceModal.id, 'no_show')}
                  disabled={isLoading}
                  className="flex flex-col items-center py-4 h-auto space-y-2 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-xs">Faltou</span>
                </Button>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAttendanceModal(null)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span>Processando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAgendaManager;
