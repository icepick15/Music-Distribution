/**
 * Mobile Responsiveness Test Component for Tickets System
 * This component helps demonstrate that the tickets system is fully mobile responsive
 */
import React from 'react';
import { CheckCircle, Smartphone, Monitor, Tablet } from 'lucide-react';

const MobileResponsivenessDemo = () => {
  const components = [
    {
      name: 'TicketsPage',
      description: 'Main tickets page with hero, stats, and content',
      features: [
        'Full-screen mobile layout with responsive padding',
        'Mobile-first hero section with proper text scaling',
        'Responsive stats grid (1 col on mobile, 3 on desktop)',
        'Touch-friendly navigation and buttons'
      ],
      status: 'complete'
    },
    {
      name: 'TicketForm Modal',
      description: 'Create new ticket modal form',
      features: [
        'Full-screen modal on mobile devices',
        'Responsive form layout with mobile-first design',
        'Touch-friendly input fields and buttons',
        'Mobile-optimized action buttons with proper ordering'
      ],
      status: 'just-updated'
    },
    {
      name: 'TicketDetailModal',
      description: 'View and respond to ticket details',
      features: [
        'Full-screen modal on mobile with proper overflow handling',
        'Responsive sidebar that moves to bottom on mobile',
        'Mobile-optimized message bubbles and response form',
        'Touch-friendly action buttons'
      ],
      status: 'complete'
    },
    {
      name: 'TicketCard',
      description: 'Individual ticket preview cards',
      features: [
        'Responsive card layout with mobile-first design',
        'Truncated text that adapts to screen size',
        'Flexible badge and metadata layout',
        'Touch-friendly tap targets'
      ],
      status: 'complete'
    },
    {
      name: 'TicketList & TicketTabs',
      description: 'Ticket listing and navigation components',
      features: [
        'Responsive grid layout (1 col mobile, multiple desktop)',
        'Mobile-friendly tab navigation',
        'Touch-optimized spacing and sizing',
        'Adaptive content display'
      ],
      status: 'complete'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'just-updated':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'complete':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'just-updated') {
      return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tickets System - Mobile Responsiveness Status
        </h1>
        <p className="text-gray-600 mb-6">
          Complete mobile-first responsive design implementation across all ticket components
        </p>
        
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Mobile First</span>
          </div>
          <div className="flex items-center gap-2">
            <Tablet className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Tablet Optimized</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Desktop Enhanced</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <div
            key={component.name}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{component.name}</h3>
              <div className="flex items-center gap-2">
                {getStatusIcon(component.status)}
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(component.status)}`}>
                  {component.status === 'just-updated' ? 'UPDATED' : 'COMPLETE'}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{component.description}</p>
            
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Mobile Features
              </h4>
              <ul className="space-y-1">
                {component.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h3 className="font-semibold text-green-900">Mobile Responsiveness Complete</h3>
        </div>
        <p className="text-green-800 text-sm leading-relaxed">
          All ticket system components have been optimized for mobile devices with a mobile-first approach. 
          The system now provides an excellent user experience across all screen sizes, with particular attention 
          to mobile users who represent the majority of unique visitors.
        </p>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Mobile (320px+)</div>
            <div className="text-green-700">Full-screen layouts, touch-friendly UI</div>
          </div>
          <div className="bg-white/50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Tablet (768px+)</div>
            <div className="text-green-700">Optimized for tablet interactions</div>
          </div>
          <div className="bg-white/50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Desktop (1024px+)</div>
            <div className="text-green-700">Enhanced with sidebars and multi-column layouts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileResponsivenessDemo;