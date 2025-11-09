import React, { useState } from "react";
import { supabase } from "../../../supabase/client";
import toast from "react-hot-toast";

export default function RegisterTest() {
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const handleTestRegister = async () => {
    setStatus("testing");
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = "Test123456";

    try {
      console.log("🚀 Iniciando prueba de registro...");

      // 1. Intentar registro
      console.log("1️⃣ Probando registro de usuario...");
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              name: "ultimo",
              role: "editor",
            },
          },
        });

      console.log("Resultado SignUp:", {
        success: !!signUpData?.user,
        userId: signUpData?.user?.id,
        error: signUpError?.message,
      });

      if (signUpError) throw signUpError;

      // 2. Verificar el usuario creado
      if (signUpData?.user) {
        console.log("2️⃣ Verificando usuario creado...");
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", signUpData.user.id)
          .single();

        console.log("Datos del usuario:", {
          found: !!userData,
          error: userError?.message,
          data: userData,
        });
      }

      setResult({ success: true, data: signUpData });
      toast.success("Prueba completada con éxito");
    } catch (error) {
      console.error("❌ Error en la prueba:", error);
      setResult({ success: false, error });
      toast.error(error.message);
    } finally {
      setStatus("completed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prueba de Registro</h2>

      <button
        onClick={handleTestRegister}
        disabled={status === "testing"}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {status === "testing" ? "Probando..." : "Iniciar Prueba"}
      </button>

      {result && (
        <div className="mt-4">
          <h3 className="font-bold">Resultado:</h3>
          <pre className="bg-gray-100 p-4 mt-2 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
