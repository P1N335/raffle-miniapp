export function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return Response.json({
    url: origin,
    name: "Raffle Mini App",
    iconUrl: `${origin}/images/08.png`,
    termsOfUseUrl: `${origin}/games/cases`,
    privacyPolicyUrl: `${origin}/games/cases`,
  });
}
