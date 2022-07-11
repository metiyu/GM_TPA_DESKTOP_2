import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import events from './events';
import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useState } from 'react';

const localizer = momentLocalizer(moment)

export function MyCalendar(){
    const [cards, setCards] = useState()
    useEffect(() => {
        const q = query(collection(db, "cards"))
        onSnapshot(q, (docs) => {
            let arr = []
            docs.forEach(doc => {
                if(!(doc.data().duedate === "" || doc.data().duedate === "none"))
                    arr.push({ title: doc.data().title, 
                                start: doc.data().startdate.toDate(), 
                                end: doc.data().duedate, 
                                id: doc.id })
            })
            setCards(arr)
        })
    }, [])

    return (
        <div>
            <Calendar
                localizer={localizer}
                events={cards}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
            />
        </div>
    )
}