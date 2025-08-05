import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import ContactList from './ContactList'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

export default function ContactsContainer() {
  const [contacts, setContacts] = useState([])

  // 1) fonction pour récupérer en base
  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
    if (error) console.error(error)
    else setContacts(data)
  }

  useEffect(() => {
    // 2) on charge la première fois
    fetchContacts()

    // 3) on s'abonne aux événements Postgres
    const channel = supabase
      .channel('public:contacts')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'contacts' },
          () => fetchContacts()  // à chaque changement, on refetch
      )
      .subscribe()

    // 4) nettoyage à la destruction
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ContactList
      contacts={contacts}
      /* passe aussi tous tes autres props like onEdit, onDelete... */
    />
  )
}
