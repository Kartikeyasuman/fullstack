import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { UserContext } from "./UserContext";
import axios from "axios";
import { Navigate } from "react-router-dom";
export default function BookingWidget({ places }) {
    const [checkin, setCheckIN] = useState('')
    const [checkout, setCheckOut] = useState('')
    const [maxnoofguest, setMaxNoOfGuests] = useState(1)
    const [name, setName] = useState('')
    const [mobile, setEmail] = useState('')
    const [phone,setPhone] = useState('');
    const [redirect,setRedirect] = useState('');
    const {user} = useContext(UserContext);
    useEffect(() => {
        if (user) {
          setName(user.name);
        }
      }, [user]);
    let numberOfNights = 0
    if (checkin && checkout) {
        numberOfNights = differenceInCalendarDays(new Date(checkout), new Date(checkin))
    }
    async function bookThisPlace() {
        const response = await axios.post('/bookings', {
          checkin,checkout,maxnoofguest,name,phone,
          place:places._id,
          price:numberOfNights * places.price,
        });
        const bookingId = response.data._id;
        setRedirect(`/account/bookings/${bookingId}`);
      }
    
      if (redirect) {
        return <Navigate to={redirect} />
      }
    return (
        <div>
            <div className="bg-white shadow p-4 rounded-2xl">
                <div className="text-2xl text-center">
                    Price:${places.price}/ Night
                </div>
                <div className="border rounded-2xl mt-4">
                    <div className="py-3 px-4">
                        <label>Check In  </label>
                        <input type="date" value={checkin} onChange={ev => setCheckIN(ev.target.value)} />
                    </div>
                    <div className="py-3 px-4 border-t">
                        <label htmlFor="">Check Out </label>
                        <input type="date" value={checkout} onChange={ev => setCheckOut(ev.target.value)} />
                    </div>

                    <div className="py-3 px-4 border-t">
                        <label htmlFor="">Number Of Guests </label>
                        <input type="number" value={maxnoofguest} onChange={ev => setMaxNoOfGuests(ev.target.value)} />
                    </div>
                    {numberOfNights > 0 && (
                        <div className="py-3 px-4 border-t">
                            <label>Your full name:</label>
                            <input type="text"
                                value={name}
                                onChange={ev => setName(ev.target.value)} />
                            <label>Phone number:</label>
                            <input type="tel"
                                value={phone}
                                onChange={ev => setPhone(ev.target.value)} />
                        </div>
                    )}
                </div>
                {/* {numberOfNights > 0 && (
                    <div className="py-3 px-4 border-t">
                        <label htmlFor="">Your Full Name </label>
                        <input type="text" value={checkout} onChange={ev => setCheckOut(ev.target.value)} />
                    </div>
                )} */}
                <button onClick={bookThisPlace} className="primary mt-4"> Book This Place</button>
                {numberOfNights > 0 && (
                    <span>${numberOfNights * places.price}</span>
                )}
            </div>
        </div>
    )
}