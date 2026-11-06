import { maskPhone } from "@hub/core";

type MaskedPhoneProps = {
  phone: string;
};

export default function MaskedPhone({ phone }: MaskedPhoneProps) {
  return <span>{maskPhone(phone)}</span>;
}
