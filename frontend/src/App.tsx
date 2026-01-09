import { useState } from 'react';

import { HomePage } from "./Pages/Home/HomePage";

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const handleLogin = () => setUser({ name: "Sacha", email: "sacha@kanto.com" });
  const handleLogout = () => setUser(null);
  const handleCartClick = () => setCartCount(prev => prev + 1);

  return (
    <HomePage 
      onStartGame={() => alert("Le jeu commence !")}
      cartItemsCount={cartCount}
      onCartClick={handleCartClick}
      onLoginClick={handleLogin}
      onSignupClick={() => {}}
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;