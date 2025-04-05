import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctor from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate();
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = () => {
    // Mock doctor data if not found in context
    const mockDoctors = [
      { _id: "1", name: "Dr. Christopher Davis", degree: "MBBS", speciality: "General physician", image: "https://via.placeholder.com/150?text=Dr.+Christopher", about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.", fees: 49, experience: "4 yrs", slots_booked: {} },
      { _id: "2", name: "Dr. John Smith", degree: "MBBS", speciality: "General physician", image: "https://via.placeholder.com/150?text=Dr.+John", about: "Dr. Smith specializes in general health and preventive care with a patient-centered approach.", fees: 49, experience: "5 yrs", slots_booked: {} },
      { _id: "3", name: "Dr. Emily Brown", degree: "MBBS", speciality: "General physician", image: "https://via.placeholder.com/150?text=Dr.+Emily", about: "Dr. Brown focuses on comprehensive care and early detection of health issues.", fees: 49, experience: "3 yrs", slots_booked: {} },
      { _id: "4", name: "Dr. Michael Lee", degree: "MBBS", speciality: "General physician", image: "https://via.placeholder.com/150?text=Dr.+Michael", about: "Dr. Lee offers expert care with an emphasis on preventive medicine.", fees: 49, experience: "6 yrs", slots_booked: {} },
      { _id: "5", name: "Dr. Sarah Davis", degree: "MBBS", speciality: "Gynecologist", image: "https://via.placeholder.com/150?text=Dr.+Sarah", about: "Dr. Sarah specializes in women’s health and reproductive care.", fees: 59, experience: "4 yrs", slots_booked: {} },
      { _id: "6", name: "Dr. Laura Wilson", degree: "MBBS", speciality: "Gynecologist", image: "https://via.placeholder.com/150?text=Dr.+Laura", about: "Dr. Wilson provides expert gynecological and prenatal care.", fees: 59, experience: "5 yrs", slots_booked: {} },
      { _id: "7", name: "Dr. Rachel Green", degree: "MBBS", speciality: "Gynecologist", image: "https://via.placeholder.com/150?text=Dr.+Rachel", about: "Dr. Green focuses on women’s health and surgical interventions.", fees: 59, experience: "3 yrs", slots_booked: {} },
      { _id: "8", name: "Dr. Anna Taylor", degree: "MBBS", speciality: "Gynecologist", image: "https://via.placeholder.com/150?text=Dr.+Anna", about: "Dr. Taylor offers comprehensive gynecological care.", fees: 59, experience: "6 yrs", slots_booked: {} },
      // Add more mock data for other specialties as needed
    ];

    const foundDoc = mockDoctors.find(doc => doc._id === docId) || doctors.find(doc => doc._id === docId);
    setDocInfo(foundDoc || null);
  };

  const getAvailableSlots = () => {
    if (!docInfo) return;

    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = `${day}_${month}_${year}`;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        if (isSlotAvailable) {
          timeSlots.push({ datetime: new Date(currentDate), time: formattedTime });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlots(prev => [...prev, timeSlots]);
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment');
      return navigate('/login');
    }

    try {
      const date = docSlots[slotIndex][0].datetime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = `${day}_${month}_${year}`;

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } });

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  return docInfo && (
    <div className="max-w-4xl mx-auto p-4">
      {/* ---------- Header ---------- */}
      

      {/* ---------- Doctor Details ---------- */}
      <div className="flex flex-col md:flex-row gap-6 bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        <div className="w-full md:w-1/3">
          <img className="w-full rounded-lg bg-blue-500" src={docInfo.image} alt={docInfo.name} />
        </div>

        <div className="w-full md:w-2/3">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name} <img className="w-5" src={assets.verified_icon} alt="Verified" />
          </p>
          <p className="text-gray-600 text-sm mt-1">{docInfo.degree} - {docInfo.speciality}</p>
          <p className="text-gray-600 text-xs mt-1">{docInfo.experience}</p>

          <div className="mt-4">
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
              About <img src={assets.info_icon} alt="Info" className="w-4" />
            </p>
            <p className="text-sm text-gray-500 mt-1">{docInfo.about}</p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee: <span className="text-gray-600 font-bold">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ---------- Booking Slots ---------- */}
      <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
        <p className="text-gray-700 font-medium">Booking slots</p>

        <div className="flex gap-3 items-center overflow-x-auto mt-4">
          {docSlots.length > 0 && docSlots.map((item, index) => (
            <div
              onClick={() => setSlotIndex(index)}
              className={`text-center py-4 px-3 min-w-[60px] rounded-full cursor-pointer flex flex-col items-center ${slotIndex === index ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-700'}`}
              key={index}
            >
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto mt-4">
          {docSlots.length > 0 && docSlots[slotIndex]?.map((item, index) => (
            <p
              onClick={() => setSlotTime(item.time)}
              className={`text-sm font-light px-4 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-blue-500 text-white' : 'text-gray-400 border border-gray-300'}`}
              key={index}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          className={`bg-blue-500 text-white text-sm font-light px-10 py-2 rounded-full mt-6 ${!slotTime ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={!slotTime}
        >
          Book appointment
        </button>
      </div>

      {/* Listing Related Doctors */}
      <RelatedDoctor docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
