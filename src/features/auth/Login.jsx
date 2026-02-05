import { useState } from "react";
import { supabase } from "../../services/supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ecoan-cream p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-ecoan-green">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-ecoan-blue">ECOAN</h2>
          <p className="text-ecoan-brown font-medium">
            Sistema de Gestión de Jornadas
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Institucional
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecoan-green focus:border-ecoan-green outline-none transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecoan-green focus:border-ecoan-green outline-none transition"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-ecoan-blue hover:bg-ecoan-green text-white py-3 rounded-lg font-bold transition-colors shadow-md"
          >
            {loading ? "Iniciando..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
      <p className="mt-8 text-xs text-ecoan-brown/70">
        © 2026 Programa Acción Andina - ECOAN
      </p>
    </div>
  );
};

export default Login;
