import { COLORS } from "@/constants";
import { useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isBusy = fetchStatus === "fetching";

  const finalizeSignUp = async () => {
    if (!signUp) return;

    const { error } = await signUp.finalize({
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
        text1: "Sign up failed",
        text2: error.message ?? "Please try again.",
      });
    }
  };

  const onSignUpPress = async () => {
    if (!signUp) return;

    if (!emailAddress || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields'
      });
      return;
    }

    try {
      const { error } = await signUp.password({
        emailAddress,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: "Failed to sign up",
          text2: error.message ?? "Something went wrong",
        });
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        Toast.show({
          type: "error",
          text1: "Failed to send code",
          text2: sendError.message ?? "Please try again.",
        });
        return;
      }

      setPendingVerification(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Sign Up',
        text2: err?.errors?.[0]?.message ?? "Something went wrong"
      });
    }
  };

  const onVerifyPress = async () => {
    if (!signUp) return;

    if (!code) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Enter verification code'
      });
      return;
    }

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to Verify',
          text2: error.message ?? "Invalid code"
        });
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification incomplete'
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Verify',
        text2: err?.errors?.[0]?.message ?? "Invalid code"
      });
    }
  };

  if (!signUp) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-surface">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6 pt-6">
        {!pendingVerification ? (
          <>
            <View className="mb-8">
              <Text className="text-3xl font-bold text-primary">Create account</Text>
              <Text className="mt-2 text-secondary">
                Sign up to start saving your favorites.
              </Text>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-secondary">First name</Text>
                <View className="flex-row items-center px-4 py-3 bg-surface rounded-xl">
                  <Ionicons name="person-outline" size={18} color={COLORS.secondary} />
                  <TextInput
                    className="flex-1 ml-3 text-primary"
                    placeholder="John"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm font-semibold text-secondary">Last name</Text>
                <View className="flex-row items-center px-4 py-3 bg-surface rounded-xl">
                  <Ionicons name="person-outline" size={18} color={COLORS.secondary} />
                  <TextInput
                    className="flex-1 ml-3 text-primary"
                    placeholder="Doe"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
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

            <TouchableOpacity
              className={`w-full items-center rounded-xl py-4 ${isBusy || !emailAddress || !password ? "bg-gray-300" : "bg-primary"
                }`}
              onPress={onSignUpPress}
              disabled={isBusy || !emailAddress || !password}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Continue</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-secondary">Already have an account? </Text>
              <Link href={"/sign-in" as Href}>
                <Text className="font-bold text-primary">Log in</Text>
              </Link>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                void signUp.reset();
                setPendingVerification(false);
                setCode("");
              }}
              className="self-start mb-6"
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-3xl font-bold text-primary">Verify email</Text>
              <Text className="mt-2 text-secondary">
                Enter the 6-digit code sent to your inbox.
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

            <TouchableOpacity
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
            </TouchableOpacity>

            <Pressable
              className="items-center w-full py-3 mt-4 border rounded-xl border-primary"
              onPress={async () => {
                const { error } = await signUp.verifications.sendEmailCode();
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
