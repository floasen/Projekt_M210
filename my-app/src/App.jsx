import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const API = import.meta.env.VITE_API
const KEY = import.meta.env.VITE_KEY

const supabase = createClient(
  API,
  KEY
);
function App() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [newMotorcycle, setNewMotorcycle] = useState({ brand: "", model: "" });
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getMotorcycles();
      }
    });

    return () => subscription.unsubscribe();
  }, []);



  if (!session) {
    return (
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
      />
    );
  }

  return (
    <div>
      <h1>Meine Motorräder</h1>
      <form onSubmit={addMotorcycle}>
        <input
          type="text"
          placeholder="Marke"
          value={newMotorcycle.brand}
          onChange={(e) => setNewMotorcycle({ ...newMotorcycle, brand: e.target.value })}
        />
        <input
          type="text"
          placeholder="Modell"
          value={newMotorcycle.model}
          onChange={(e) => setNewMotorcycle({ ...newMotorcycle, model: e.target.value })}
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <h2>Meine Motorräder Liste</h2>
      <ul>
        {motorcycles.map((motorcycle) => (
          <li key={motorcycle.id}>
            <span>{motorcycle.brand} {motorcycle.model}</span>
            <button onClick={() => deleteMotorcycle(motorcycle.id)}>Löschen</button>
            <button onClick={() => {
              const newBrand = prompt("Neue Marke:", motorcycle.brand);
              const newModel = prompt("Neues Modell:", motorcycle.model);
              if (newBrand && newModel) {
                updateMotorcycle(motorcycle.id, newBrand, newModel);
              }
            }}>Bearbeiten</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;