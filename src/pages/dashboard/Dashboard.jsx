import React from "react";
import { Calendar, Users, LayoutGrid, Clock, UserCircle } from "lucide-react";
import Container from "../../components/shared/container/Container";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Exam Seat Planner</h1>
          <button className="bg-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Admin
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Container className="flex items-center justify-between py-12">
            <span>Total Exams</span>
            <Calendar className="text-blue-500" />
          </Container>
          <Container className="flex items-center justify-between py-12">
            <span>Total Students</span>
            <Users className="text-green-500" />
          </Container>
          <Container className="flex items-center justify-between py-12">
            <span>Available Rooms</span>
            <LayoutGrid className="text-purple-500" />
          </Container>
          <Container className="flex items-center justify-between py-12">
            <span>Upcoming Exams</span>
            <Clock className="text-orange-500" />
          </Container>
        </div>

        <Container className="py-10">
          <h2 className="text-xl font-semibold mb-4">Recent Seating Plans</h2>
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="flex justify-between py-4 border-b last:border-b-0"
            >
              <div>
                <h3 className="text-lg font-medium">Mid-Term Examination</h3>
                <p className="text-gray-500">
                  120 students &nbsp; | &nbsp; 4 rooms
                </p>
              </div>
              <button className="text-blue-500 hover:underline">
                View Details
              </button>
            </div>
          ))}
        </Container>
      </div>
    </div>
  );
};

export default DashboardPage;
