import React, { useContext as uC } from 'react';

export const Context = React.createContext();
export const useContext = () => uC(Context);