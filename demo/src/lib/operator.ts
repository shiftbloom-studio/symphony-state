// Operator details for the imprint and privacy policy. They are read from build-time
// environment variables (see demo/.env.example), so the repository holds no personal data.

export type Operator = {
  name?: string;
  business?: string;
  street?: string;
  city?: string;
  country: { en?: string; de?: string };
  email?: string;
  phone?: string;
  vatId?: string;
  authority?: string;
};

const value = (key: string) => {
  const v = process.env[key]?.trim();
  return v ? v : undefined;
};

export const getOperator = (): Operator => ({
  name: value("OPERATOR_NAME"),
  business: value("OPERATOR_BUSINESS"),
  street: value("OPERATOR_STREET"),
  city: value("OPERATOR_CITY"),
  country: { en: value("OPERATOR_COUNTRY_EN"), de: value("OPERATOR_COUNTRY_DE") },
  email: value("OPERATOR_EMAIL"),
  phone: value("OPERATOR_PHONE"),
  vatId: value("OPERATOR_VAT_ID"),
  authority: value("SUPERVISORY_AUTHORITY"),
});

export const isConfigured = (op: Operator) => Boolean(op.name && op.street && op.city);
