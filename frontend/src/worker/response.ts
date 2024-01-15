export const getBadRequestResponse = (
  message: string = "Invalid request",
  status: number = 400
) => {
  return new Response(
    JSON.stringify({
      message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getSuccessResponse = (
  data: any,
  contentType?: string,
  status: number = 200
) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": contentType || "application/json",
    },
  });
};
