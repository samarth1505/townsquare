import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  isValidOtp,
  maskPhone,
  RESEND_COOLDOWN_SECONDS,
  sanitizeOtpInput,
  useCountdown,
} from "@hub/core";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import TextField from "@/shared/components/TextField";
import { space } from "@/shared/theme/tokens";
import { AUTH_MESSAGES } from "../messages";

type OtpStepProps = {
  phone: string;
  submitting: boolean;
  errorMessage?: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onBack: () => void;
};

export default function OtpStep({
  phone,
  submitting,
  errorMessage,
  onVerify,
  onResend,
  onBack,
}: OtpStepProps) {
  const [otp, setOtp] = useState("");
  const isValid = isValidOtp(otp);
  // The same countdown hook the web app uses (it lives in @hub/core).
  const { secondsLeft, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);

  function verify() {
    if (isValid && !submitting) onVerify(otp);
  }

  return (
    <View style={styles.card}>
      <AppText variant="title">{AUTH_MESSAGES.otpTitle(maskPhone(phone))}</AppText>
      <TextField
        label={AUTH_MESSAGES.otpLabel}
        value={otp}
        onChangeText={(text) => setOtp(sanitizeOtpInput(text))}
        keyboardType="number-pad"
        autoFocus // put the cursor in the box as soon as this step appears
        autoComplete="sms-otp" // Android can read the code from the SMS and offer it
        textContentType="oneTimeCode" // iOS offers the code from the SMS above the keyboard
        returnKeyType="done"
        onSubmitEditing={verify}
        error={errorMessage}
      />
      <Button
        label={AUTH_MESSAGES.verify}
        onPress={verify}
        disabled={!isValid}
        loading={submitting}
      />
      <Button
        label={secondsLeft > 0 ? AUTH_MESSAGES.resendIn(secondsLeft) : AUTH_MESSAGES.resend}
        variant="secondary"
        disabled={secondsLeft > 0 || submitting}
        onPress={() => {
          onResend();
          restart();
        }}
      />
      <Button
        label={AUTH_MESSAGES.changeNumber}
        variant="secondary"
        disabled={submitting}
        onPress={onBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({ card: { gap: space.lg } });
