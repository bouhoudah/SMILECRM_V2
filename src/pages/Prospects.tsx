import React from 'react';
import { useData } from '../context/DataContext';
import Contacts from './Contacts';

const Prospects = () => {
  const { contacts } = useData();
  const prospectContacts = contacts.filter(contact => contact.statut === 'prospect');

  return <Contacts initialFilter="prospect" />;
};

export default Prospects;