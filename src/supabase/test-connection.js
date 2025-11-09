import { supabase } from "./client";

async function testSupabaseConnection() {
  console.log("🔍 Probando conexión con Supabase...");

  try {
    // 1. Probar auth
    console.log("1️⃣ Probando servicio de autenticación...");
    const { data: authData, error: authError } =
      await supabase.auth.getSession();
    console.log("Resultado auth:", {
      success: !!authData,
      error: authError?.message,
    });

    // 2. Probar acceso a la base de datos
    console.log("2️⃣ Probando acceso a la base de datos...");
    const { data: dbData, error: dbError } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    console.log("Resultado DB:", {
      success: !!dbData,
      error: dbError?.message,
    });

    // 3. Intentar una inserción de prueba
    console.log("3️⃣ Probando inserción en la base de datos...");
    const testUser = {
      email: "test_" + Date.now() + "@test.com",
      name: "Test User",
      role: "test",
    };
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert([testUser])
      .select();
    console.log("Resultado inserción:", {
      success: !!insertData,
      error: insertError?.message,
      data: insertData,
    });

    if (insertData) {
      // Limpiar el usuario de prueba
      await supabase.from("users").delete().match({ email: testUser.email });
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error en la prueba de conexión:", error);
    return { success: false, error };
  }
}

// Ejecutar la prueba
testSupabaseConnection().then((result) => {
  console.log("Resultado final de la prueba:", result);
});
