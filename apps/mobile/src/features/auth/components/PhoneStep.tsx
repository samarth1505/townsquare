import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { isValidPhone, sanitizePhoneInput, type OtpChannel } from "@hub/core";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import TextField from "@/shared/components/TextField";
import { space } from "@/shared/theme/tokens";
import { AUTH_MESSAGES } from "../messages";
import SegmentedControl from "@/shared/components/SegmentedControl";

const CHANNEL_OPTIONS = (["sms", "whatsapp", "call"] as const).map((value) => ({
  value,
  label: AUTH_MESSAGES.channels[value],
}));

type PhoneStepProps = {
  onSubmit: (phone: string, channel: OtpChannel) => void;
  locked: boolean; // true while the OTP step is showing (or a code is being sent), so the number can't change
  sending: boolean;
};

export default function PhoneStep({ onSubmit, locked, sending }: PhoneStepProps) {
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<OtpChannel>("sms");
  const isValid = isValidPhone(phone); // derived from state, computed every render, never stored

  function submit() {
    if (isValid && !locked) onSubmit(phone, channel);
  }

  return (
    <View style={styles.card}>
      <AppText variant="title">{AUTH_MESSAGES.loginTitle}</AppText>
      <TextField
        label={AUTH_MESSAGES.phoneLabel}
        value={phone}
        onChangeText={(text) => setPhone(sanitizePhoneInput(text))} // digits only, max 10 (the shared rule)
        keyboardType="number-pad" // the numeric keypad
        autoComplete="tel" // Android autofill hint
        textContentType="telephoneNumber" // iOS autofill hint
        returnKeyType="send"
        onSubmitEditing={submit} // the keyboard's "send" key submits, like pressing Enter on the web
        editable={!locked}
      />
      <SegmentedControl
        label={AUTH_MESSAGES.channelLabel}
        options={CHANNEL_OPTIONS}
        value={channel}
        onChange={setChannel}
        disabled={locked}
      />
      <Button
        label={AUTH_MESSAGES.sendCode}
        onPress={submit}
        disabled={!isValid || locked}
        loading={sending}
      />
    </View>
  );
}

const styles = StyleSheet.create({ card: { gap: space.lg } });
