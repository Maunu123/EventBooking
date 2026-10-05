import { createContext, useContext } from 'react';
export const EventsContext = createContext(null);
export const useEvents = () => useContext(EventsContext);
