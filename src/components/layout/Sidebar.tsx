'use client';

import { useState, Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartPieIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  PlusCircleIcon,
  BellIcon,
  PowerIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  FolderIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  BookOpenIcon,
  PresentationChartLineIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import type { UserRole } from '@/types'

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
  badge?: string | number;
  description?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useCustomAuth();
  const pathname = usePathname();

  // Configuração de menus por role
  const getMenuSections = (): MenuSection[] => {
    switch (user?.role) {
      case 'admin':
        return [
          {
            title: 'Administração',
            items: [
              { name: 'Dashboard', href: '/admin', icon: HomeIcon }
            ]
          },
          {
            title: 'Operações',
            items: [
              { name: 'Agenda', href: '/secretaria/agenda', icon: CalendarIcon },
              { name: 'Pacientes', href: '/secretaria/pacientes', icon: UsersIcon },
              { name: 'Documentos', href: '/secretaria/documentos', icon: DocumentTextIcon }
            ]
          },
          {
            title: 'Financeiro',
            items: [
              { name: 'Dashboard Financeiro', href: '/admin/financial', icon: CreditCardIcon },
              { name: 'Analytics', href: '/admin/analytics', icon: ChartPieIcon },
              { name: 'Relatórios', href: '/admin/reports', icon: PresentationChartLineIcon }
            ]
          },
          {
            title: 'Sistema',
            items: [
              { name: 'Logs', href: '/admin/logs', icon: ListBulletIcon },
              { name: 'Backup', href: '/admin/backup', icon: FolderIcon }
            ]
          }
        ];

      case 'professional':
        return [
          {
            title: 'Atendimento',
            items: [
              { name: 'Dashboard', href: '/medico', icon: HomeIcon },
              { name: 'Meus Pacientes', href: '/medico/pacientes', icon: UsersIcon },
              { name: 'Prontuários', href: '/medico/records', icon: ClipboardDocumentListIcon },
              { name: 'Agenda', href: '/medico/schedule', icon: CalendarIcon }
            ]
          },
          {
            title: 'Comunicação',
            items: [
              { name: 'Tarefas', href: '/medico/tasks', icon: ListBulletIcon },
              { name: 'Mensagens', href: '/medico/messages', icon: ChatBubbleLeftRightIcon },
              { name: 'Questionários', href: '/medico/questionnaires', icon: DocumentCheckIcon }
            ]
          },
          {
            title: 'Relatórios',
            items: [
              { name: 'Evolução Clínica', href: '/medico/evolution', icon: ChartBarIcon },
              { name: 'Documentos', href: '/medico/documents', icon: DocumentTextIcon }
            ]
          }
        ];

      case 'secretary':
        return [
          {
            title: 'Gestão',
            items: [
              { name: 'Dashboard', href: '/secretaria', icon: HomeIcon },
              { name: 'Agenda', href: '/secretaria/agenda', icon: CalendarIcon },
              { name: 'Pacientes', href: '/secretaria/pacientes', icon: UsersIcon },
              { name: 'Documentos', href: '/secretaria/documentos', icon: DocumentTextIcon }
            ]
          },
          {
            title: 'Comunicação',
            items: [
              { name: 'Atendimento', href: '/secretaria/attendance', icon: PhoneIcon },
              { name: 'Emails', href: '/secretaria/emails', icon: EnvelopeIcon },
              { name: 'Notificações', href: '/secretaria/notifications', icon: BellIcon }
            ]
          },
          {
            title: 'Relatórios',
            items: [
              { name: 'Financeiro', href: '/secretaria/financial', icon: CreditCardIcon },
              { name: 'Operacional', href: '/secretaria/operational', icon: ChartBarIcon }
            ]
          }
        ];

      case 'patient':
        return [
          {
            title: 'Minha Área',
            items: [
              { name: 'Dashboard', href: '/paciente', icon: HomeIcon },
              { name: 'Minhas Consultas', href: '/paciente/appointments', icon: CalendarIcon },
              { name: 'Diário de Humor', href: '/paciente/mood', icon: HeartIcon },
              { name: 'Tarefas', href: '/paciente/tasks', icon: ListBulletIcon }
            ]
          },
          {
            title: 'Saúde',
            items: [
              { name: 'Questionários', href: '/paciente/questionnaires', icon: DocumentCheckIcon },
              { name: 'Medicamentos', href: '/paciente/medications', icon: PlusCircleIcon },
              { name: 'Documentos', href: '/paciente/documents', icon: DocumentTextIcon }
            ]
          },
          {
            title: 'Comunicação',
            items: [
              { name: 'Mensagens', href: '/paciente/messages', icon: ChatBubbleLeftRightIcon },
              { name: 'Histórico', href: '/paciente/history', icon: BookOpenIcon }
            ]
          }
        ];

      default:
        return [
          {
            title: 'Geral',
            items: [
              { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
              { name: 'Perfil', href: '/profile', icon: UserCircleIcon }
            ]
          }
        ];
    }
  };

  const menuSections = getMenuSections();

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'Administrador',
      professional: 'Médico',
      secretary: 'Secretária',
      patient: 'Paciente'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      professional: 'bg-blue-100 text-blue-800',
      secretary: 'bg-green-100 text-green-800',
      patient: 'bg-purple-100 text-purple-800'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-white shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">ClinicaApp</h2>
              <p className="text-xs text-blue-100">Sistema de Gestão</p>
            </div>
          </div>
          {mobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-2 text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.full_name || user.email}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {menuSections.map((section, sectionIdx) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => mobile && setSidebarOpen(false)}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon 
                        className={`
                          mr-3 h-5 w-5 transition-colors
                          ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}
                        `} 
                      />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="space-y-2">
          {user?.role === 'admin' && (
            <Link
              href="/admin/settings"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
              Configurações
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <PowerIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <SidebarContent mobile={true} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Abrir sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Mobile header content */}
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center">
            <h1 className="text-lg font-semibold text-gray-900">ClinicaApp</h1>
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user.full_name}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
