import { Music, DollarSign, TrendingUp, Users } from "lucide-react";

export default function OverviewCards() {
  const cards = [
    {
      title: "Total Streams",
      value: "1.2M",
      change: "+15.3%",
      changeType: "increase",
      icon: Music,
      color: "blue",
      subtitle: "This month"
    },
    {
      title: "Total Revenue",
      value: "₦6,200,000",
      change: "+22.1%",
      changeType: "increase", 
      icon: DollarSign,
      color: "green",
      subtitle: "Lifetime earnings"
    },
    {
      title: "Monthly Listeners",
      value: "45,800",
      change: "+8.7%",
      changeType: "increase",
      icon: Users,
      color: "purple",
      subtitle: "Unique listeners"
    },
    {
      title: "Avg. Daily Streams",
      value: "7,200",
      change: "+12.4%",
      changeType: "increase",
      icon: TrendingUp,
      color: "orange",
      subtitle: "Per day average"
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600", 
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const gradientClass = getColorClasses(card.color);
        
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                card.changeType === 'increase' 
                  ? 'bg-green-100 text-green-700' 
                  : card.changeType === 'decrease'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {card.change}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                {card.value}
              </p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
