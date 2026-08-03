import React from 'react';

export type JourneyStage =
  | 'PICKUP_PENDING'
  | 'BUS_ARRIVING'
  | 'BUS_ARRIVED'
  | 'BOARDED'
  | 'IN_TRANSIT'
  | 'REACHED_UNIVERSITY'
  | 'RETURN_TRIP_PENDING'
  | 'RETURN_STARTED'
  | 'RETURN_IN_TRANSIT'
  | 'REACHED_HOME'
  | 'COMPLETED'
  | 'NO_TRIP'
  | 'HOLIDAY'
  | 'ROUTE_CHANGED'
  | 'BUS_DELAYED';

interface JourneyStatusCardProps {
  stage: JourneyStage;
  delayMinutes?: number;
  timeRemaining?: string;
  busNumber?: string;
}

export const JourneyStatusCard: React.FC<JourneyStatusCardProps> = ({
  stage,
  delayMinutes,
  timeRemaining,
  busNumber,
}) => {
  const getStatusInfo = () => {
    const info = {
      PICKUP_PENDING: {
        title: 'Waiting for Pickup',
        description: 'Your bus is on the way to pickup point',
        icon: '⏳',
        color: 'from-blue-500 to-cyan-500',
        progress: 10,
        nextStage: 'Bus Arriving',
      },
      BUS_ARRIVING: {
        title: 'Bus Arriving Soon',
        description: `Bus ${busNumber} will arrive in ${timeRemaining}`,
        icon: '🚌',
        color: 'from-orange-500 to-amber-500',
        progress: 25,
        nextStage: 'Board the bus',
      },
      BUS_ARRIVED: {
        title: 'Bus Has Arrived',
        description: 'Your bus is at the pickup point',
        icon: '✋',
        color: 'from-green-500 to-emerald-500',
        progress: 35,
        nextStage: 'Ready to board',
      },
      BOARDED: {
        title: 'Boarded Successfully',
        description: `You are on Bus ${busNumber}`,
        icon: '✅',
        color: 'from-green-600 to-emerald-600',
        progress: 50,
        nextStage: 'In transit to university',
      },
      IN_TRANSIT: {
        title: 'On The Way',
        description: 'Journey in progress to university',
        icon: '🛣️',
        color: 'from-purple-500 to-indigo-500',
        progress: 65,
        nextStage: 'Reaching university',
      },
      REACHED_UNIVERSITY: {
        title: 'Reached University',
        description: 'Your morning journey is complete',
        icon: '🎓',
        color: 'from-green-600 to-teal-600',
        progress: 85,
        nextStage: 'Return trip in evening',
      },
      RETURN_TRIP_PENDING: {
        title: 'Return Trip Pending',
        description: `Return trip starts at ${timeRemaining}`,
        icon: '🔄',
        color: 'from-indigo-500 to-blue-500',
        progress: 85,
        nextStage: 'Return trip boarding',
      },
      RETURN_STARTED: {
        title: 'Return Trip Started',
        description: 'Heading back home',
        icon: '🏠',
        color: 'from-purple-600 to-pink-600',
        progress: 75,
        nextStage: 'On the way home',
      },
      RETURN_IN_TRANSIT: {
        title: 'Returning Home',
        description: 'Journey in progress to home',
        icon: '🛣️',
        color: 'from-purple-500 to-pink-500',
        progress: 90,
        nextStage: 'Reaching home',
      },
      REACHED_HOME: {
        title: 'Reached Home',
        description: 'Your complete journey is finished for today',
        icon: '🏡',
        color: 'from-green-600 to-emerald-600',
        progress: 100,
        nextStage: 'See you tomorrow',
      },
      COMPLETED: {
        title: 'Journey Completed',
        description: 'All journeys for today are done',
        icon: '✨',
        color: 'from-gold-500 to-yellow-500',
        progress: 100,
        nextStage: 'See you tomorrow',
      },
      NO_TRIP: {
        title: 'No Trip Today',
        description: 'No buses assigned for today',
        icon: '📭',
        color: 'from-gray-400 to-gray-500',
        progress: 0,
        nextStage: 'Check tomorrow',
      },
      HOLIDAY: {
        title: 'Holiday Today',
        description: 'Enjoy your holiday! Next trip starts tomorrow',
        icon: '🎉',
        color: 'from-pink-500 to-rose-500',
        progress: 0,
        nextStage: 'See you tomorrow',
      },
      ROUTE_CHANGED: {
        title: '⚠️ Route Changed',
        description: 'Your route has been updated for today',
        icon: '🔄',
        color: 'from-red-500 to-orange-500',
        progress: 15,
        nextStage: 'Check new route details',
      },
      BUS_DELAYED: {
        title: '⏰ Bus Delayed',
        description: `Bus is delayed by ${delayMinutes} minutes`,
        icon: '⏰',
        color: 'from-red-500 to-amber-500',
        progress: 10,
        nextStage: 'Wait for bus arrival',
      },
    };

    return info[stage] || info.NO_TRIP;
  };

  const info = getStatusInfo();

  return (
    <div
      className={`bg-gradient-to-r ${info.color} rounded-xl shadow-lg p-6 mb-6 text-white overflow-hidden relative`}
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 opacity-10 rounded-full"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon and Title */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{info.icon}</span>
          <h2 className="text-2xl md:text-3xl font-bold">{info.title}</h2>
        </div>

        {/* Description */}
        <p className="text-white text-opacity-90 mb-4 text-sm md:text-base">
          {info.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white text-opacity-80">
              Today's Journey Progress
            </span>
            <span className="text-sm font-bold text-white">
              {info.progress}%
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${info.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Next Stage */}
        <div className="text-xs text-white text-opacity-75 font-medium">
          ➜ Next: {info.nextStage}
        </div>
      </div>
    </div>
  );
};
