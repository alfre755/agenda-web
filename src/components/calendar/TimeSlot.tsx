"use client";

import React from "react";
import PropTypes from "prop-types";

function TimeSlot({ onClick, appointment }) {
  return (
    <div
      onClick={onClick}
      className="w-full h-10 rounded-md bg-background border border-border"
    >
      {appointment || "No cita agendada"}
    </div>
  );
}

TimeSlot.propTypes = {
  appointment: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TimeSlot;
