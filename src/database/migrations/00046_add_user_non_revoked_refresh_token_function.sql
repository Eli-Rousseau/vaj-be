CREATE OR REPLACE FUNCTION shop."nonRevokedRefreshTokens"("user" shop."user")
RETURNS SETOF shop."refreshToken"
LANGUAGE plpgsql
AS $$
DECLARE
  result shop."refreshToken";
BEGIN
  RETURN QUERY
  SELECT "refreshToken".*
  FROM shop."refreshToken"
  WHERE "refreshToken".user = "user".reference
    AND "refreshToken"."revokedAt" IS NULL
  ORDER BY "refreshToken"."updatedAt" DESC;
END;
$$;