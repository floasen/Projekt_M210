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
  const [brands, setBrands] = useState([]);
  const [newMotorcycle, setNewMotorcycle] = useState({ marke: "", name: "", kauf_datum: "" });
  const [newBrand, setNewBrand] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getMotorcycles();
        getBrands();
      }
    });

    return () => subscription.unsubscribe();
  }, []);


// Abrufen der Motorräder
async function getMotorcycles() {
  if (!session) return;
  const { data, error } = await supabase
    .from("Motorrad")
    .select("id, name, kauf_datum, marke (id, marke)") // marke wird aus Motorrad_Marke geladen
    .eq("owner", session.user.id);

  if (error) {
    console.error("Fehler beim Abrufen der Motorräder:", error);
  } else {
    setMotorcycles(data);
  }
}

// Abrufen der Marken
async function getBrands() {
  const { data, error } = await supabase.from("Motorrad_Marke").select("id, marke");

  if (error) {
    console.error("Fehler beim Abrufen der Marken:", error);
  } else {
    console.log("Marken erfolgreich abgerufen:", data);
    setBrands(data);
  }
}

// Hinzufügen eines neuen Motorrads
async function addMotorcycle(e) {
  e.preventDefault();
  if (!newMotorcycle.marke || !newMotorcycle.name.trim()) {
    alert("Bitte wählen Sie eine Marke und geben Sie ein Modell ein.");
    return;
  }

  const { error } = await supabase.from("Motorrad").insert([{
    marke: newMotorcycle.marke,
    name: newMotorcycle.name,
    kauf_datum: newMotorcycle.kauf_datum,
    owner: session.user.id,
  }]);

  if (error) {
    console.error("Fehler beim Hinzufügen des Motorrads:", error);
  } else {
    setNewMotorcycle({ marke: "", name: "", kauf_datum: "" });
    getMotorcycles(); // Liste neu laden
  }
}

// Hinzufügen einer neuen Marke
async function addBrand(e) {
  e.preventDefault();
  if (!newBrand.trim()) {
    alert("Bitte geben Sie eine Marke ein.");
    return;
  }

  const { error } = await supabase.from("Motorrad_Marke").insert([{ marke: newBrand }]);

  if (error) {
    console.error("Fehler beim Hinzufügen der Marke:", error);
  } else {
    setNewBrand("");
    getBrands(); // Liste der Marken neu laden
  }
}

// Bearbeiten eines Motorrads
async function updateMotorcycle(id, marke, name, kauf_datum) {
  const { error } = await supabase
    .from("Motorrad")
    .update({ marke: marke, name, kauf_datum })
    .eq("id", id);

  if (error) {
    console.error("Fehler beim Aktualisieren des Motorrads:", error);
  } else {
    getMotorcycles();
  }
}

// Löschen eines Motorrads
async function deleteMotorcycle(id) {
  const { error } = await supabase
    .from("Motorrad")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Fehler beim Löschen des Motorrads:", error);
  } else {
    getMotorcycles();
  }
}

if (!session) {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="dark"
    />
  );
}



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

      <form onSubmit={addBrand}>
        <input
          type="text"
          placeholder="Neue Marke eingeben"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
        />
        <button type="submit">Marke hinzufügen</button>
      </form>

      <form onSubmit={addMotorcycle}>
        <select
          value={newMotorcycle.marke}
          onChange={(e) => setNewMotorcycle({ ...newMotorcycle, marke: e.target.value })}
        >
         <option value="">Marke wählen</option>
          {console.log("Brands:", brands)} {/* Debugging */}
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.marke}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Modellname eingeben"
          value={newMotorcycle.name}
          onChange={(e) => setNewMotorcycle({ ...newMotorcycle, name: e.target.value })}
        />

        <input
          type="date"
          value={newMotorcycle.kauf_datum}
          onChange={(e) => setNewMotorcycle({ ...newMotorcycle, kauf_datum: e.target.value })}
        />

        <button type="submit">Motorrad hinzufügen</button>
      </form>


      <h2>Motorrad Liste</h2>
      <ul>
        {motorcycles.map((motorcycle) => (
          <li key={motorcycle.id}>
            <span>{motorcycle.marke.marke} - {motorcycle.name} (Gekauft am: {motorcycle.kauf_datum})</span>
            <button onClick={() => deleteMotorcycle(motorcycle.id)}>Löschen</button>
            <button onClick={() => {
              const newMarkeId = prompt("Neue Marke-ID eingeben:", motorcycle.marke.id);
              const newName = prompt("Neuen Modellnamen eingeben:", motorcycle.name);
              const newKaufDatum = prompt("Neues Kaufdatum eingeben:", motorcycle.kauf_datum);
              if (newMarkeId && newName) {
                updateMotorcycle(motorcycle.id, newMarkeId, newName, newKaufDatum);
              }
            }}>Bearbeiten</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;