import Image from "next/image";

import logoSrc from "@/public/logo.png";
import AuthForm from "@/components/auth/auth-form";

const LoginPage = () => {
  return (
    <div className="flex flex-col min-h-full justify-center py-12 sm:px-6 lg:px-6 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image height="48" width="48" className="mx-auto w-auto animate-bounce" src={logoSrc} alt="logo" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          JARVIS
        </h2>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <AuthForm />
      </div>
    </div>
  );
};

export default LoginPage;
