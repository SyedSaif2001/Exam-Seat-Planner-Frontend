import React, { useEffect } from 'react';

const Modal = ({ onClose }) => {

    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto'; // Reset on modal close
      };
    }, []);
  const examData = [
    {
      room: 'Room 1',
      students: [
        { seat: '1', name: 'Saifullah', cms: '57368', dept: 'IT', batch: 'Fall 2021' },
  { seat: '2', name: 'Turab', cms: '57972', dept: 'CS', batch: 'Fall 2021' },
  { seat: '3', name: 'Hassan Mujtaba', cms: '57384', dept: 'IT', batch: 'Fall 2021' },
  { seat: '4', name: 'Ali Raza', cms: '57400', dept: 'CS', batch: 'Fall 2021' },
  { seat: '5', name: 'Ayesha Khan', cms: '57370', dept: 'IT', batch: 'Fall 2021' },
  { seat: '6', name: 'Bilal Ahmed', cms: '57390', dept: 'CS', batch: 'Fall 2021' },
  { seat: '7', name: 'Zainab Fatima', cms: '57410', dept: 'IT', batch: 'Fall 2021' },
  { seat: '8', name: 'Usman Tariq', cms: '57415', dept: 'CS', batch: 'Fall 2021' },
  { seat: '9', name: 'Noor Ul Ain', cms: '57420', dept: 'IT', batch: 'Fall 2021' },
  { seat: '10', name: 'Hamza Shah', cms: '57425', dept: 'CS', batch: 'Fall 2021' },
  { seat: '11', name: 'Sana Malik', cms: '57430', dept: 'IT', batch: 'Fall 2021' },
  { seat: '12', name: 'Fahad Ali', cms: '57435', dept: 'CS', batch: 'Fall 2021' },
  { seat: '13', name: 'Mariam Yousaf', cms: '57440', dept: 'IT', batch: 'Fall 2021' },
  { seat: '14', name: 'Imran Aslam', cms: '57445', dept: 'CS', batch: 'Fall 2021' },
  { seat: '15', name: 'Areeba Shahid', cms: '57450', dept: 'IT', batch: 'Fall 2021' },
  { seat: '16', name: 'Jawad Ali', cms: '57455', dept: 'CS', batch: 'Fall 2021' },
  { seat: '17', name: 'Nida Tariq', cms: '57460', dept: 'IT', batch: 'Fall 2021' },
  { seat: '18', name: 'Ahmad Nawaz', cms: '57465', dept: 'CS', batch: 'Fall 2021' },
  { seat: '19', name: 'Sara Adeel', cms: '57470', dept: 'IT', batch: 'Fall 2021' },
  { seat: '20', name: 'Kashif Mehmood', cms: '57475', dept: 'CS', batch: 'Fall 2021' },
  { seat: '21', name: 'Hira Anwar', cms: '57480', dept: 'IT', batch: 'Fall 2021' },
  { seat: '22', name: 'Rizwan Haider', cms: '57485', dept: 'CS', batch: 'Fall 2021' },
  { seat: '23', name: 'Tooba Khalid', cms: '57490', dept: 'IT', batch: 'Fall 2021' },
  { seat: '24', name: 'Shahbaz Khan', cms: '57495', dept: 'CS', batch: 'Fall 2021' },
  { seat: '25', name: 'Laiba Noor', cms: '57500', dept: 'IT', batch: 'Fall 2021' },
  { seat: '26', name: 'Noman Qureshi', cms: '57505', dept: 'CS', batch: 'Fall 2021' },
  { seat: '27', name: 'Iqra Zafar', cms: '57510', dept: 'IT', batch: 'Fall 2021' },
  { seat: '28', name: 'Tariq Jameel', cms: '57515', dept: 'CS', batch: 'Fall 2021' },
  { seat: '29', name: 'Sundas Farooq', cms: '57520', dept: 'IT', batch: 'Fall 2021' },
  { seat: '30', name: 'Omar Khalid', cms: '57525', dept: 'CS', batch: 'Fall 2021' },
      ],
    },
    {
      room: 'Room 2',
      students: [
        { seat: 'B-1', name: 'Ali', cms: '58123', dept: 'CS', batch: 'Spring 2023' },
        { seat: 'B-2', name: 'Ahmed', cms: '58456', dept: 'CE', batch: 'Spring 2023' },
        { seat: 'B-3', name: 'Sara', cms: '58789', dept: 'CS', batch: 'Spring 2023' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-center">Final-Term Examination</h2>
        <p className="text-sm text-center text-gray-600">10:00 AM - 1:00 PM</p>

        <div className="mt-6 space-y-6">
          {examData.map((room, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{room.room}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border border-gray-300 rounded-md">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border">Seat Number</th>
                      <th className="px-4 py-2 border">Student Name</th>
                      <th className="px-4 py-2 border">CMS ID</th>
                      <th className="px-4 py-2 border">Department</th>
                      <th className="px-4 py-2 border">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.students.map((student, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2 border">{student.seat}</td>
                        <td className="px-4 py-2 border">{student.name}</td>
                        <td className="px-4 py-2 border">{student.cms}</td>
                        <td className="px-4 py-2 border">{student.dept}</td>
                        <td className="px-4 py-2 border">{student.batch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
