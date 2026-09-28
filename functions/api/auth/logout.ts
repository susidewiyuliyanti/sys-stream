export const onRequestPost:
  PagesFunction = async () => {
    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Logout successful.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type':
            'application/json',
          'Cache-Control':
            'no-store',
        },
      }
    );
  };
