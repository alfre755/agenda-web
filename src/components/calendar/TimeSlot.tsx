"use client";

import React from "react";

interface TimeSlotProps {
  appointments: any[];
}

function TimeSlot({ appointments }: TimeSlotProps) {
  const handleOnClick = () => {
    console.log("Clicked on time slot");
  };

  return (
    <div
      onClick={handleOnClick}
      className="w-full h-10 rounded-md bg-background border border-border hover:bg-gray-50 cursor-pointer overflow-hidden"
    >
      {appointments && appointments.length > 0 ? (
        <div className="p-1">
          {appointments.map((appointment, index) => {
            // Determinar el color según el estado
            const getStatusColor = (status: string) => {
              switch (status) {
                case "in-progress":
                  return "bg-blue-100 text-blue-800";
                case "completed":
                  return "bg-green-100 text-green-800";
                case "cancelled":
                  return "bg-red-100 text-red-800";
                default:
                  return "bg-gray-100 text-gray-800";
              }
            };

            return (
              <div
                key={index}
                className={`text-xs ${getStatusColor(
                  appointment.status
                )} rounded px-1`}
              >
                <div className="font-medium">{appointment.clientName}</div>
                <div className="text-xs opacity-75">{appointment.status}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
          Disponible
        </div>
      )}
    </div>
  );
}

export default TimeSlot;
