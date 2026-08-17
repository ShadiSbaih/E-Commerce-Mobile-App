import { COLORS } from "@/constants";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Page() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const isBusy = fetchStatus === "fetching";

  const finalizeSignIn = async () => {
    if (!signIn) return;

    const { error } = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session?.currentTask);
          return;
        }

        const url = decorateUrl("/");
        if (url.startsWith("http") && typeof window !== "undefined") {
          window.location.href = url;
        } else {
          setTimeout(() => { router.replace(url as Href); }, 0);
        }
      },
    });

    if (error) {
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: error.message ?? "Please try again.",
      });
    }
  };

  const onSignInPress = async () => {

    if (!signIn) return;
    if (!emailAddress || !password) return;

    try {
      const { error } = await signIn.password({
        emailAddress,
        password,
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: "Sign in failed",
          text2: error.message ?? "Please try again.",
        });
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
      } else if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
      ) {
        const { error: mfaError } = await signIn.mfa.sendEmailCode();
        if (mfaError) {
          Toast.show({
            type: "error",
            text1: "Verification failed",
            text2: mfaError.message ?? "Unable to send code.",
          });
          return;
        }
        setShowEmailCode(true);
      } else if (signIn.status === "needs_new_password") {
        Toast.show({
          type: "error",
          text1: "Password reset required",
          text2: "Please reset your password to continue.",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: message,
      });
    }
  };

  const onVerifyPress = async () => {
    if (!signIn || !code) return;

    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });
      if (error) {
        Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: error.message ?? "Invalid verification code",
        });
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid verification code";
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: message,
      });
    }
  };

  if (!signIn) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-surface">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6 pt-6">
        {!showEmailCode ? (
          <>
            <View className="mb-8">
              <Text className="text-3xl font-bold text-primary">Welcome back</Text>
              <Text className="mt-2 text-secondary">Sign in to continue shopping.</Text>
            </View>

            <View className="gap-2 mb-4">
              <Text className="text-sm font-semibold text-secondary">Email</Text>
              <View className="flex-row items-center px-4 py-3 bg-surface rounded-xl">
                <Ionicons name="mail-outline" size={18} color={COLORS.secondary} />
                <TextInput
                  className="flex-1 ml-3 text-primary"
                  placeholder="user@example.com"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />
              </View>
            </View>

            <View className="gap-2 mb-6">
              <Text className="text-sm font-semibold text-secondary">Password</Text>
              <View className="flex-row items-center px-4 py-3 bg-surface rounded-xl">
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.secondary} />
                <TextInput
                  className="flex-1 ml-3 text-primary"
                  placeholder="********"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={COLORS.secondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              className={`w-full items-center rounded-xl py-4 ${isBusy || !emailAddress || !password ? "bg-gray-300" : "bg-primary"
                }`}
              onPress={onSignInPress}
              disabled={isBusy || !emailAddress || !password}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Sign in</Text>
              )}
            </Pressable>

            <View className="flex-row justify-center mt-6">
              <Text className="text-secondary">Don&apos;t have an account? </Text>
              <Link href={"/sign-up" as Href}>
                <Text className="font-bold text-primary">Sign up</Text>
              </Link>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                setShowEmailCode(false);
                setCode("");
              }}
              className="self-start mb-6"
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-3xl font-bold text-primary">Verify email</Text>
              <Text className="mt-2 text-secondary">
                Enter the 6-digit code sent to your email.
              </Text>
            </View>

            <View className="mb-6">
              <TextInput
                className="w-full px-4 py-4 text-lg tracking-widest text-center bg-surface rounded-xl text-primary"
                placeholder="123456"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
            </View>

            <Pressable
              className={`w-full items-center rounded-xl py-4 ${isBusy ? "bg-gray-300" : "bg-primary"
                }`}
              onPress={onVerifyPress}
              disabled={isBusy}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Verify</Text>
              )}
            </Pressable>

            <Pressable
              className="items-center w-full py-3 mt-4 border rounded-xl border-primary"
              onPress={async () => {
                const { error } = await signIn.mfa.sendEmailCode();
                if (error) {
                  Toast.show({
                    type: "error",
                    text1: "Unable to resend",
                    text2: error.message ?? "Please try again in a moment.",
                  });
                }
              }}
              disabled={isBusy}
            >
              <Text className="font-semibold text-primary">Resend code</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
