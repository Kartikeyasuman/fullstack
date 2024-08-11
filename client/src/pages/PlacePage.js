import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Image from "../Image";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "./AddressLink";
export default function PlacePage() {
    const { id } = useParams()
    const [places, setPlaces] = useState(null);
    
    
    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get(`/places/${id}`).then(response => {
            setPlaces(response.data)
        })
    }, [id])
    if (!places) return ''
   
    return (
        <div className="mt-8 bg-gray-100 -mx-8 px-8 pt-8">

            <h1 className="text-xl">{places.title} </h1>
                <AddressLink>{places.address}</AddressLink>
                <PlaceGallery place={places}/>
            <div className="mt-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        {places.description}
                        </div>
                        Check In: {places.checkIn} <br /> <br />
                    Check Out:{places.checkOut}  <br /> <br />
                    Max Guests:{places.maxGuests}  <br />
                </div>
                <div>
                    <BookingWidget places={places}/>
                </div>
            </div>
            <div>
                <h2 className="font-semibold text-2xl">
                    Extra Info
                </h2>
            </div>
            <div className="mb-4 mt-1 text-sm text-gray-700 leading-4">
                {places.extraInfo}
            </div>
        </div>
    )
}