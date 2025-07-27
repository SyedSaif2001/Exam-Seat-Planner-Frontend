import React, { useMemo } from 'react';

// Color palette for department/batch
const colorPalette = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
];

const SeatingPlanVisualizer = ({ seatingPlan = [], roomData = [], studentMap = {} }) => {
  // Build legend: collect all dept/batch from all students assigned to seats in all rooms, using fallbacks
  const legend = useMemo(() => {
    const set = new Set();
    roomData.forEach(room => {
      const seats = room.seats || room.Seats || [];
      seats.forEach(seat => {
        const student = studentMap[String(seat.student_id || seat.StudentID)];
        const department = student?.department || seat.department || room.department || '';
        const batch = student?.batch || seat.batch || room.batch || '';
        const deptBatch = (department && batch) ? `${department}/${batch}` : 'Unknown';
        set.add(deptBatch);
      });
    });
    return Array.from(set);
  }, [roomData, studentMap]);

  const getColor = (deptBatch) => {
    const idx = legend.indexOf(deptBatch);
    return idx >= 0 ? colorPalette[idx % colorPalette.length] : '#D1D5DB';
  };

  return (
    <div
      className="p-4"
      style={{
        maxHeight: '80vh', // Scroll height limit
        overflowY: 'auto', // Enables vertical scrolling
      }}
    >
      {roomData.map((room, idx) => {
        const roomName = room.room?.Name || room.room?.name || room.Name || room.name || `Room ${idx + 1}`;
        const rows = Number(room.room?.Rows || room.room?.rows || room.Rows || room.rows || 0);
        const columns = Number(room.room?.Columns || room.room?.columns || room.Columns || room.columns || 0);
        if (!rows || !columns) return null;

        const seats = room.seats || room.Seats || [];
        const hasExplicitSeats = Array.isArray(seats) && seats.length > 0;

        const debugGrid = [];

        return (
          <div key={room._id || idx} className="mb-10">
            <div className="font-bold text-lg mb-2">{roomName}</div>
            <div className="text-gray-500 mb-2 text-sm">Rows: {rows}, Columns: {columns}, Capacity: {room.room?.Capacity || room.Capacity || room.capacity || '-'}</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 28px)`,
                gap: '6px',
                background: '#f3f4f6',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                width: 'fit-content',
              }}
            >
              {[...Array(rows)].map((_, rowIdx) =>
                [...Array(columns)].map((_, colIdx) => {
                  let student = null;
                  let seatDebug = {};
                  let seat = null;
                  if (hasExplicitSeats) {
                    seat = seats.find(s => {
                      const r = s.row ?? s.Row;
                      const c = s.column ?? s.Column;
                      return Number(r) === rowIdx + 1 && Number(c) === colIdx + 1;
                    });
                    if (seat) {
                      student = studentMap[String(seat.student_id || seat.StudentID)] || null;
                      seatDebug = { row: seat.row ?? seat.Row, col: seat.column ?? seat.Column, student_id: seat.student_id ?? seat.StudentID, name: student?.name };
                    } else {
                      seatDebug = { row: rowIdx + 1, col: colIdx + 1, student_id: null, name: null };
                    }
                  }
                  debugGrid.push(seatDebug);

                  const department = student?.department || seat?.department || room.department || '';
                  const batch = student?.batch || seat?.batch || room.batch || '';
                  const deptBatch = (department && batch) ? `${department}/${batch}` : 'Unknown';
                  const color = getColor(deptBatch);

                  return (
                    <div
                      key={`r${rowIdx}c${colIdx}`}
                      title={student ? `${student.name} (${student.student_id})\n${deptBatch}` : `Empty Seat`}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: student ? color : '#e5e7eb',
                        border: student ? '2px solid #333' : '1px solid #bbb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#222',
                        cursor: student ? 'pointer' : 'default',
                        opacity: student ? 1 : 0.5,
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      {student ? `${rowIdx + 1},${colIdx + 1}` : ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div className="mt-6">
        <div className="font-semibold mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4">
          {legend.map((deptBatch, i) => (
            <div key={deptBatch} className="flex items-center gap-2 text-sm">
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: colorPalette[i % colorPalette.length],
                  display: 'inline-block',
                  border: '1px solid #888',
                }}
              ></span>
              <span>{deptBatch}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatingPlanVisualizer;
