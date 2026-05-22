export const maskPhone = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").substring(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
};

export const maskCNPJ = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").substring(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.substring(0, 2)}.${digits.substring(2)}`;
  if (digits.length <= 8) return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5)}`;
  if (digits.length <= 12) return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8)}`;
  return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12)}`;
};

export const maskCPF = (value: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").substring(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
  if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
  return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`;
};

export const unmask = (value: string) => {
  return value ? value.replace(/\D/g, "") : "";
};
