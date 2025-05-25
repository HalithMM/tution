import React from "react";

export const Dropout = ({ fetchData }) => {
  return (
    <div className="p-5 bg-gray-50 min-h-screen">
  <div className="border-b border-gray-300 mb-6">
    <h1 className="font-bold text-3xl text-center text-indigo-700 py-4">
      Dropout Students
    </h1>
  </div>

  {/* 12th Standard Section */}
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">12th Standard</h2>
    {fetchData.filter((item) => item.standard === "12th").length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fetchData
          .filter((item) => item.standard === "12th")
          .map((name, id) => (
            <div
              key={id}
              className="bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg"
            >
              <h3 className="font-bold text-lg text-gray-800">{name.studentName}</h3>
              <p className="text-gray-600">Father: {name.fatherName}</p>
              <p className="text-gray-600">Phone: {name.phoneNumber}</p>
              <p className="text-gray-600">School: {name.schoolName}</p>
              <div className="mt-2">
                <p className="font-medium text-gray-700">Subjects:</p>
                {name.subjects.map((sub, idx) => (
                  <div key={idx} className="text-gray-600 ml-4">• {sub}</div>
                ))}
              </div>
            </div>
          ))}
      </div>
    ) : (
      <h3 className="text-gray-500">No data found</h3>
    )}
  </div>

  {/* 11th Standard Section */}
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">11th Standard</h2>
    {fetchData.filter((item) => item.standard === "11th").length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fetchData
          .filter((item) => item.standard === "11th")
          .map((name, id) => (
            <div
              key={id}
              className="bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg"
            >
              <h3 className="font-bold text-lg text-gray-800">{name.studentName}</h3>
              <p className="text-gray-600">Father: {name.fatherName}</p>
              <p className="text-gray-600">Phone: {name.phoneNumber}</p>
              <p className="text-gray-600">School: {name.schoolName}</p>
              <div className="mt-2">
                <p className="font-medium text-gray-700">Subjects:</p>
                {name.subjects.map((sub, idx) => (
                  <div key={idx} className="text-gray-600 ml-4">• {sub}</div>
                ))}
              </div>
            </div>
          ))}
      </div>
    ) : (
      <h3 className="text-gray-500">No data found</h3>
    )}
  </div>

  {/* 10th Standard Section */}
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">10th Standard</h2>
    {fetchData.filter((item) => item.standard === "10th").length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fetchData
          .filter((item) => item.standard === "10th")
          .map((name, id) => (
            <div
              key={id}
              className="bg-white shadow-md rounded-lg p-4 transition hover:shadow-lg"
            >
              <h3 className="font-bold text-lg text-gray-800">{name.studentName}</h3>
              <p className="text-gray-600">Father: {name.fatherName}</p>
              <p className="text-gray-600">Phone: {name.phoneNumber}</p>
              <p className="text-gray-600">School: {name.schoolName}</p>
              <div className="mt-2">
                <p className="font-medium text-gray-700">Subjects:</p>
                {name.subjects.map((sub, idx) => (
                  <div key={idx} className="text-gray-600 ml-4">• {sub}</div>
                ))}
              </div>
            </div>
          ))}
      </div>
    ) : (
      <h3 className="text-gray-500">No data found</h3>
    )}
  </div>
</div>

  );
};
