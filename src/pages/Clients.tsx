import React from 'react';
import { useData } from '../context/DataContext';
import Contacts from './Contacts';

const Clients = () => {
  const { contacts } = useData();
  const clientContacts = contacts.filter(contact => contact.statut === 'client');

  return <Contacts initialFilter="client" />;
};

export default Clients;