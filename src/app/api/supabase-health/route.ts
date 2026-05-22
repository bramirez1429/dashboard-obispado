export async function GET() {
  try {
    const { supabase } = await import('@/lib/supabase/client');

    const { data, error, count } = await supabase
      .from('Users')
      .select('id, name, lastname', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Error conectando Supabase', error);

      return Response.json(
        {
          success: false,
          error: error.message,
          details: error,
        },
        { status: 500 },
      );
    }

    console.log('✅ Supabase conectado correctamente', { data, count });

    return Response.json({
      success: true,
      table: 'Users',
      count,
      data,
    });
  } catch (error) {
    console.error('❌ Error conectando Supabase', error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
        details: error,
      },
      { status: 500 },
    );
  }
}
