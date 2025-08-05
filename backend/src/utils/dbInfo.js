
export const logDatabaseInfo = async () => {
  console.log(
    'Info: Supabase ne permet pas d’appeler `current_database` directement via RPC.'
  );

  // Si jamais tu veux quand même tester une autre RPC à l’avenir, tu peux décommenter ci-dessous :
  /*
  try {
    const { data, error } = await supabase.rpc('current_database');

    if (error) {
      console.error('Erreur lors de la récupération des informations de la base de données:', error.message);
      return;
    }

    console.log('Base de données Supabase actuelle:', data);
  } catch (err) {
    console.error('Erreur inattendue:', err);
  }
  */
};
